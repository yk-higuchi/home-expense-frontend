/**
 * インタラクションの決まりを、部品ごとに状態を並べて確認するページ
 * （storybook-addon-pseudo-states で :hover / :active / :focus-visible を強制表示している）
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { Button, type ButtonVariant } from "./Button/Button";
import { Pagination } from "./Pagination/Pagination";
import { Select } from "./Select/Select";
import { SideBar } from "./SideBar/SideBar";
import { TableActions } from "./Table/TableActions";
import { TextInput } from "./TextInput/TextInput";

const noop = (): void => {};
const STATES = ["通常", "ホバー", "押下", "フォーカス"] as const;
const KEYS = ["default", "hover", "active", "focus"] as const;

const Row = ({
  label,
  note,
  cells,
}: {
  label: string;
  note?: string;
  cells: ReactNode[];
}) => (
  <>
    <div style={{ fontSize: 14, lineHeight: 1.5 }}>
      {label}
      {note && <div style={{ fontSize: 12, color: "#757575" }}>{note}</div>}
    </div>
    {cells.map((cell, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: 列の並びは固定
      <div key={i}>{cell}</div>
    ))}
  </>
);

const Grid = ({
  extraHeads = [],
  children,
}: {
  extraHeads?: string[];
  children: ReactNode;
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `160px repeat(${STATES.length + extraHeads.length}, minmax(0, 1fr))`,
      gap: "16px 24px",
      alignItems: "center",
      padding: 24,
      color: "#757575",
      fontFamily: "var(--font-family-base)",
    }}
  >
    <div />
    {[...STATES, ...extraHeads].map((h) => (
      <div key={h} style={{ fontSize: 14, fontWeight: 700 }}>
        {h}
      </div>
    ))}
    {children}
  </div>
);

const variants: { v: ButtonVariant; label: string }[] = [
  { v: "primary", label: "登録" },
  { v: "secondary", label: "キャンセル" },
  { v: "danger", label: "削除" },
  { v: "subtle", label: "詳細" },
];

const meta = {
  title: "Foundations/インタラクション",
  parameters: {
    layout: "fullscreen",
    pseudo: {
      hover: [
        ...variants.map(({ v }) => `#btn-${v}-hover`),
        "#input-hover",
        "#select-hover",
        "#nav-hover li:nth-child(2) a",
        "#page-hover li:nth-child(2) button",
        "#actions-hover button",
      ],
      active: [
        ...variants.map(({ v }) => `#btn-${v}-active`),
        "#nav-active li:nth-child(2) a",
        "#page-active li:nth-child(2) button",
        "#actions-active button",
      ],
      focusVisible: [
        ...variants.map(({ v }) => `#btn-${v}-focus`),
        "#input-focus",
        "#select-focus",
        "#nav-focus li:nth-child(2) a",
        "#page-focus li:nth-child(2) button",
        "#actions-focus button:last-child",
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 共通の決まり
 * - ホバー: 1 段濃く（選択中がある部品は、選択中より薄い水色で区別）
 * - 押下: ホバーよりさらに 1 段濃く
 * - フォーカス: 2px の隙間＋2px の濃い線（#3f4a4c）
 * - 無効: 無効/* の色
 */
export const 状態の一覧: Story = {
  render: () => (
    <>
      <Grid extraHeads={["無効", "処理中"]}>
        {variants.map(({ v, label }) => (
          <Row
            key={v}
            label={`ボタン（${v}）`}
            cells={[
              ...KEYS.map((k) => (
                <Button key={k} id={`btn-${v}-${k}`} variant={v}>
                  {label}
                </Button>
              )),
              <Button key="disabled" variant={v} disabled>
                {label}
              </Button>,
              <Button key="loading" variant={v} loading>
                {label}
              </Button>,
            ]}
          />
        ))}
      </Grid>
      <Grid extraHeads={["エラー", "無効"]}>
        <Row
          label="テキスト入力"
          note="押下はなし"
          cells={[
            <TextInput key="d" label="属性名" defaultValue="家賃" />,
            <TextInput
              key="h"
              id="input-hover"
              label="属性名"
              defaultValue="家賃"
            />,
            <span key="a">—</span>,
            <TextInput
              key="f"
              id="input-focus"
              label="属性名"
              defaultValue="家賃"
            />,
            <TextInput
              key="e"
              label="属性名"
              defaultValue=""
              errorMessage="入力してください"
            />,
            <TextInput key="x" label="属性名" defaultValue="家賃" disabled />,
          ]}
        />
        <Row
          label="プルダウン"
          note="押下はなし"
          cells={[
            <Select key="d" label="分類">
              <option>固定費</option>
            </Select>,
            <Select key="h" id="select-hover" label="分類">
              <option>固定費</option>
            </Select>,
            <span key="a">—</span>,
            <Select key="f" id="select-focus" label="分類">
              <option>固定費</option>
            </Select>,
            <Select key="e" label="分類" errorMessage="選択してください">
              <option>固定費</option>
            </Select>,
            <Select key="x" label="分類" disabled>
              <option>固定費</option>
            </Select>,
          ]}
        />
      </Grid>
      <Grid>
        <Row
          label="ナビ項目"
          note="1 つめが選択中。2 つめの状態を表示"
          cells={KEYS.map((k) => (
            <div key={k} id={`nav-${k}`} style={{ height: 150 }}>
              <SideBar
                items={[
                  { label: "HOME", href: "#", active: true },
                  { label: "経費属性", href: "#a" },
                  { label: "経費", href: "#b" },
                ]}
              />
            </div>
          ))}
        />
        <Row
          label="ページ送り"
          note="1 ページめが選択中。2 の状態を表示"
          cells={KEYS.map((k) => (
            <div key={k} id={`page-${k}`}>
              <Pagination
                currentPage={1}
                totalPages={3}
                onPageChange={noop}
                previousLabel=""
                nextLabel=""
              />
            </div>
          ))}
        />
        <Row
          label="表の操作アイコン"
          note="削除アイコンはホバー・押下で薄い赤"
          cells={KEYS.map((k) => (
            <div key={k} id={`actions-${k}`}>
              <TableActions onEdit={noop} onDelete={noop} />
            </div>
          ))}
        />
      </Grid>
    </>
  ),
};
