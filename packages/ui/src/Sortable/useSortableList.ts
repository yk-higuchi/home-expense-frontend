"use client";

import {
  type KeyboardEvent,
  type PointerEvent,
  type RefCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";

import styles from "./Sortable.module.css";

export interface SortableListOptions<T> {
  items: readonly T[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  onReorder: (ids: string[], move: { from: number; to: number }) => void;
  disabled?: boolean;
}

interface DragState {
  id: string;
  from: number;
  to: number;
  mode: "pointer" | "keyboard";
}

const AUTO_SCROLL_EDGE = 48;
const AUTO_SCROLL_STEP = 12;

const moveItem = <V>(list: readonly V[], from: number, to: number): V[] => {
  const next = [...list];
  const [moved] = next.splice(from, 1);
  if (moved !== undefined) next.splice(to, 0, moved);
  return next;
};

const findScrollParent = (element: HTMLElement | undefined): HTMLElement => {
  for (let node = element?.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
  }
  return document.scrollingElement as HTMLElement;
};

export const useSortableList = <T>({
  items,
  getId,
  getLabel,
  onReorder,
  disabled = false,
}: SortableListOptions<T>) => {
  const ids = items.map(getId);
  const rows = useRef(new Map<string, HTMLElement>());
  const pointerY = useRef(0);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const labelOf = (id: string): string => {
    const item = items.find((candidate) => getId(candidate) === id);
    return item === undefined ? "" : getLabel(item);
  };
  const positionText = (index: number): string =>
    `${index + 1} 番目（全 ${ids.length} 件中）`;

  const targetIndex = (clientY: number, id: string): number => {
    let index = 0;
    for (const other of ids) {
      if (other === id) continue;
      const rect = rows.current.get(other)?.getBoundingClientRect();
      if (rect && clientY > rect.top + rect.height / 2) index += 1;
    }
    return index;
  };

  const finish = (state: DragState, to: number): void => {
    setDrag(null);
    if (to === state.from) {
      setAnnouncement(`${labelOf(state.id)}は元の位置のままです`);
      return;
    }
    onReorder(moveItem(ids, state.from, to), { from: state.from, to });
    setAnnouncement(`${labelOf(state.id)}を ${to + 1} 番目に移動しました`);
  };

  const cancel = (state: DragState): void => {
    setDrag(null);
    setAnnouncement(`${labelOf(state.id)}の移動を取り消しました`);
  };

  const followPointer = useEffectEvent((y: number) => {
    if (drag === null) return;
    const to = targetIndex(y, drag.id);
    if (to !== drag.to) setDrag({ ...drag, to });
  });

  const releasePointer = useEffectEvent((y: number) => {
    if (drag?.mode === "pointer") finish(drag, targetIndex(y, drag.id));
  });

  const cancelDrag = useEffectEvent(() => {
    if (drag !== null) cancel(drag);
  });

  const pointerDragId = drag?.mode === "pointer" ? drag.id : null;

  useEffect(() => {
    if (pointerDragId === null) return;
    const container = findScrollParent(rows.current.get(pointerDragId));
    const isDocument = container === document.scrollingElement;
    let frame = 0;
    const tick = (): void => {
      const bounds = isDocument
        ? { top: 0, bottom: window.innerHeight }
        : container.getBoundingClientRect();
      const y = pointerY.current;
      if (y < bounds.top + AUTO_SCROLL_EDGE) {
        container.scrollTop -= AUTO_SCROLL_STEP;
      } else if (y > bounds.bottom - AUTO_SCROLL_EDGE) {
        container.scrollTop += AUTO_SCROLL_STEP;
      }
      followPointer(y);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const onPointerMove = (event: globalThis.PointerEvent): void => {
      if (event.buttons === 0) {
        releasePointer(event.clientY);
        return;
      }
      pointerY.current = event.clientY;
    };
    const onPointerUp = (event: globalThis.PointerEvent): void => {
      releasePointer(event.clientY);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key === "Escape") cancelDrag();
    };
    const onCancel = (): void => cancelDrag();
    const { userSelect } = document.body.style;
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("blur", onCancel);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("blur", onCancel);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.userSelect = userSelect;
    };
  }, [pointerDragId]);

  const handleProps = (item: T) => {
    const id = getId(item);
    const index = ids.indexOf(id);
    const isLifted = drag?.id === id && drag.mode === "keyboard";
    return {
      "aria-label": `${getLabel(item)}を並べ替え`,
      "aria-pressed": isLifted,
      disabled,
      onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
        if (disabled || event.button !== 0 || drag?.mode === "keyboard") return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        pointerY.current = event.clientY;
        setDrag({ id, from: index, to: index, mode: "pointer" });
      },
      onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) return;
        const isSelectKey = event.key === " " || event.key === "Enter";
        if (!isLifted || drag === null) {
          if (!isSelectKey || drag !== null) return;
          event.preventDefault();
          setDrag({ id, from: index, to: index, mode: "keyboard" });
          setAnnouncement(
            `${getLabel(item)}を持ち上げました。${positionText(index)}。上下の矢印キーで動かし、Space キーで確定、Esc キーで取り消します`,
          );
          return;
        }
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
          const step = event.key === "ArrowUp" ? -1 : 1;
          const to = Math.min(ids.length - 1, Math.max(0, drag.to + step));
          setDrag({ ...drag, to });
          setAnnouncement(`${getLabel(item)}、${positionText(to)}`);
        } else if (isSelectKey) {
          event.preventDefault();
          finish(drag, drag.to);
        } else if (event.key === "Escape") {
          event.preventDefault();
          cancel(drag);
        }
      },
      onBlur: () => {
        if (isLifted && drag !== null) cancel(drag);
      },
    };
  };

  const dropTarget = (() => {
    if (drag === null || drag.to === drag.from) return null;
    const others = ids.filter((id) => id !== drag.id);
    const before = others[drag.to];
    if (before !== undefined) return { id: before, position: "before" };
    const last = others[others.length - 1];
    return last === undefined ? null : { id: last, position: "after" };
  })();

  const rowProps = (
    item: T,
  ): { ref: RefCallback<HTMLElement>; className?: string } => {
    const id = getId(item);
    const className =
      drag?.id === id
        ? styles.dragging
        : dropTarget?.id === id
          ? dropTarget.position === "before"
            ? styles.dropBefore
            : styles.dropAfter
          : undefined;
    return {
      ref: (element) => {
        if (element === null) return;
        rows.current.set(id, element);
        return () => {
          rows.current.delete(id);
        };
      },
      className,
    };
  };

  const canMove = (item: T, step: -1 | 1): boolean => {
    const to = ids.indexOf(getId(item)) + step;
    return !disabled && to >= 0 && to < ids.length;
  };

  const moveBy = (item: T, step: -1 | 1): void => {
    if (!canMove(item, step)) return;
    const from = ids.indexOf(getId(item));
    onReorder(moveItem(ids, from, from + step), { from, to: from + step });
    setAnnouncement(
      `${getLabel(item)}を ${from + step + 1} 番目に移動しました`,
    );
  };

  return {
    handleProps,
    rowProps,
    canMove,
    moveBy,
    announcement,
    isDragging: drag !== null,
  };
};
