import {
  Breakdown,
  BreakdownGroup,
  Button,
  Card,
  PlusIcon,
  Select,
  Skeleton,
  SummaryList,
  SummaryRow,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextInput,
} from "@home-expense/ui";
import type { ReactElement } from "react";
import annual from "@/ui/annual-report.module.css";
import aggregate from "@/ui/expense-aggregate.module.css";
import form from "@/ui/parts/form.module.css";
import layout from "@/ui/parts/list-layout.module.css";
import {
  ANNUAL_COLUMNS,
  ColumnsHead,
  EXPENSE_ATTRIBUTE_COLUMNS,
  EXPENSE_COLUMNS,
  INCOME_ATTRIBUTE_COLUMNS,
  INCOME_COLUMNS,
  SkeletonTable,
  tableProps,
} from "@/ui/parts/table-columns";
import style from "./skeletons.module.css";

const AddButton = (): ReactElement => (
  <div className={layout.actions}>
    <Button icon={<PlusIcon />} skeleton>
      追加
    </Button>
  </div>
);

const Totals = (): ReactElement => (
  <SummaryList>
    {["収入合計", "支出合計", "収支合計"].map((label) => (
      <SummaryRow key={label} label={label} amount={<Skeleton width={96} />} />
    ))}
  </SummaryList>
);

const ExpenseListSkeleton = (): ReactElement => (
  <div className={layout.page}>
    <div className={layout.toolbar}>
      <div className={layout.filters}>
        <Select label="年" className={layout.yearFilter} skeleton />
        <Select label="月" className={layout.monthFilter} skeleton />
        <Select label="分類" className={layout.categoryFilter} skeleton />
        <Select label="属性名" className={layout.attributeFilter} skeleton />
      </div>
      <AddButton />
    </div>
    <SkeletonTable columns={EXPENSE_COLUMNS} />
  </div>
);

const IncomeListSkeleton = (): ReactElement => (
  <div className={layout.page}>
    <div className={layout.toolbar}>
      <div className={layout.filters}>
        <Select label="年" className={layout.yearFilter} skeleton />
      </div>
      <AddButton />
    </div>
    <SkeletonTable columns={INCOME_COLUMNS} />
  </div>
);

const ExpenseAttributeListSkeleton = (): ReactElement => (
  <div className={layout.page}>
    <div className={layout.toolbar}>
      <div className={layout.filters}>
        <Select label="分類" className={layout.categoryFilter} skeleton />
      </div>
      <AddButton />
    </div>
    <SkeletonTable columns={EXPENSE_ATTRIBUTE_COLUMNS} />
  </div>
);

const IncomeAttributeListSkeleton = (): ReactElement => (
  <div className={layout.page}>
    <AddButton />
    <SkeletonTable columns={INCOME_ATTRIBUTE_COLUMNS} />
  </div>
);

const HomeSkeleton = (): ReactElement => (
  <div className={aggregate.page}>
    <div className={layout.filters}>
      <Select label="年" className={layout.yearFilter} skeleton />
      <Select label="月" className={layout.monthFilter} skeleton />
    </div>
    <div className={aggregate.content}>
      <div className={aggregate.main}>
        <Totals />
        <SummaryRow label="内訳" />
        <Breakdown className={aggregate.breakdown}>
          <BreakdownGroup label="固定費" amount={null} />
          <BreakdownGroup label="変動費" amount={null} />
        </Breakdown>
      </div>
      <Card title="支出の多い順" className={aggregate.ranking}>
        <div className={style.bars}>
          {[100, 80, 60, 40, 20].map((width) => (
            <Skeleton key={width} width={`${width}%`} />
          ))}
        </div>
      </Card>
    </div>
  </div>
);

const AnnualReportSkeleton = (): ReactElement => (
  <div className={annual.page}>
    <div className={layout.filters}>
      <Select label="年" className={layout.yearFilter} skeleton />
    </div>
    <div className={annual.content}>
      <Totals />
      <Card title="月別の推移">
        <div className={style.chart} />
      </Card>
      <Card title="月別の収支">
        <Table variant="plain" {...tableProps(ANNUAL_COLUMNS)}>
          <ColumnsHead columns={ANNUAL_COLUMNS} />
          <TableBody>
            {Array.from({ length: 12 }, (_, month) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 月の並びは固定
              <TableRow key={month}>
                {[0, 1, 2, 3].map((cell) => (
                  <TableCell key={cell}>
                    <Skeleton />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  </div>
);

type FieldKind = readonly [label: string, kind: "text" | "select"];

const FormSkeleton = ({
  fields,
  button,
}: {
  fields: readonly FieldKind[];
  button: string;
}): ReactElement => (
  <div className={form.formStyle}>
    {fields.map(([label, kind]) =>
      kind === "text" ? (
        <TextInput key={label} label={label} skeleton />
      ) : (
        <Select key={label} label={label} skeleton />
      ),
    )}
    <Button fullWidth skeleton>
      {button}
    </Button>
  </div>
);

const FIELDS: Record<string, readonly FieldKind[]> = {
  expense: [
    ["説明", "text"],
    ["金額", "text"],
    ["支払日", "text"],
    ["分類", "select"],
    ["属性名", "select"],
  ],
  income: [
    ["説明", "text"],
    ["金額", "text"],
    ["受取日", "text"],
    ["属性名", "select"],
  ],
  "expense-attribute": [
    ["属性名", "text"],
    ["分類", "select"],
  ],
  "income-attribute": [["属性名", "text"]],
};

const LISTS: Record<string, () => ReactElement> = {
  home: HomeSkeleton,
  "annual-report": AnnualReportSkeleton,
  expense: ExpenseListSkeleton,
  income: IncomeListSkeleton,
  "expense-attribute": ExpenseAttributeListSkeleton,
  "income-attribute": IncomeAttributeListSkeleton,
};

export const skeletonFor = (href: string): ReactElement | null => {
  const [section, child] = new URL(href, "http://localhost").pathname
    .split("/")
    .filter(Boolean);
  if (section === undefined) return null;
  if (child === undefined) {
    const List = LISTS[section];
    return List ? <List /> : null;
  }
  const fields = FIELDS[section];
  if (!fields) return null;
  return (
    <FormSkeleton
      fields={fields}
      button={child === "registration" ? "登録" : "更新"}
    />
  );
};
