"use client";

import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  useState,
} from "react";

import styles from "./Chart.module.css";

interface ChartInteractionSeries {
  label: string;
  color: string;
  texts: readonly string[];
  markerY: readonly (number | null)[] | null;
}

interface ChartInteractionProps {
  title: string;
  labels: readonly string[];
  series: readonly ChartInteractionSeries[];
  descriptions: readonly string[];
  height: number;
  plotTop: number;
  plotHeight: number;
  children: ReactNode;
}

const percent = (value: number): string => `${value * 100}%`;

export const ChartInteraction = ({
  title,
  labels,
  series,
  descriptions,
  height,
  plotTop,
  plotHeight,
  children,
}: ChartInteractionProps): ReactElement => {
  const [active, setActive] = useState(-1);
  const [announcement, setAnnouncement] = useState("");
  const count = labels.length;

  const select = (i: number, announce: boolean): void => {
    setActive(i);
    if (announce) setAnnouncement(i >= 0 ? (descriptions[i] ?? "") : "");
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || count === 0) return;
    const i = Math.floor(((event.clientX - rect.left) / rect.width) * count);
    select(Math.max(0, Math.min(count - 1, i)), false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (count === 0) return;
    const keys: Record<string, number> = {
      ArrowRight: Math.min(count - 1, Math.max(0, active) + 1),
      ArrowLeft: Math.max(0, active - 1),
      Home: 0,
      End: count - 1,
      Escape: -1,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next, true);
  };

  const flip = active >= 0 && (active + 0.5) / count > 0.6;

  return (
    <>
      {/* biome-ignore lint/a11y/useSemanticElements: フォームではなく、矢印キーで値を読み上げるグラフの入れ物なので fieldset は使わない */}
      <div
        className={styles.plot}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: 矢印キーで値を読み上げるため、グラフの入れ物にフォーカスを当てる
        tabIndex={0}
        role="group"
        aria-label={`${title}（左右の矢印キーで値を読み上げ）`}
        onKeyDown={handleKeyDown}
        onBlur={() => select(-1, false)}
        style={{ height }}
      >
        <div className={styles.area} aria-hidden="true">
          {active >= 0 && (
            <div
              className={styles.activeBand}
              style={{
                left: percent(active / count),
                width: percent(1 / count),
                top: plotTop,
                height: plotHeight,
              }}
            />
          )}
        </div>
        {children}
        <div className={styles.area}>
          {active >= 0 && (
            <svg className={styles.svg} aria-hidden="true">
              {series.map((s) => {
                const y = s.markerY?.[active];
                return typeof y === "number" ? (
                  <circle
                    key={s.label}
                    className={styles.marker}
                    style={{ fill: s.color }}
                    cx={percent((active + 0.5) / count)}
                    cy={y}
                    r={5}
                  />
                ) : null;
              })}
            </svg>
          )}
          <div
            className={styles.hitArea}
            style={{ top: plotTop, height: plotHeight }}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => select(-1, false)}
          />
          {active >= 0 && (
            <div
              className={styles.tooltip}
              style={{
                left: flip
                  ? `calc(${percent(active / count)} - 8px)`
                  : `calc(${percent((active + 1) / count)} + 8px)`,
                top: plotTop,
                transform: flip ? "translateX(-100%)" : undefined,
              }}
              aria-hidden="true"
            >
              <p className={styles.tooltipLabel}>{labels[active]}</p>
              <ul className={styles.tooltipRows}>
                {series.map((s) => (
                  <li key={s.label} className={styles.tooltipRow}>
                    <span
                      className={styles.tooltipKey}
                      style={{ background: s.color }}
                    />
                    <span className={styles.tooltipValue}>
                      {s.texts[active]}
                    </span>
                    <span className={styles.tooltipName}>{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <p className={styles.srOnly} role="status" aria-live="polite">
        {announcement}
      </p>
    </>
  );
};
