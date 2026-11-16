const currentYear = (): number => new Date(Date.now()).getFullYear();

const withSaved = (params: URLSearchParams, savedId: string): string => {
  params.delete("saved");
  params.set("saved", savedId);
  return params.toString();
};

export const expenseListUrl = ({
  from,
  paymentDate,
  category,
  attributeId,
  savedId,
}: {
  from?: string;
  paymentDate: string;
  category: string;
  attributeId: string;
  savedId: string;
}): string => {
  const [year, month] = paymentDate.split("-").map(Number);
  const back = new URLSearchParams(from ?? "");
  const listMonth = Number(back.get("month")) || undefined;
  const listCategory = back.get("category") || undefined;
  const listAttribute = back.get("attributeId") || undefined;
  const visible =
    from !== undefined &&
    (Number(back.get("year")) || currentYear()) === year &&
    (listMonth === undefined || listMonth === month) &&
    (listCategory === undefined || listCategory === category) &&
    (listAttribute === undefined || listAttribute === attributeId);
  const params = visible
    ? back
    : new URLSearchParams({ year: String(year), month: String(month) });
  return `/expense?${withSaved(params, savedId)}`;
};

export const incomeListUrl = ({
  from,
  receiveDate,
  savedId,
}: {
  from?: string;
  receiveDate: string;
  savedId: string;
}): string => {
  const [year] = receiveDate.split("-").map(Number);
  const back = new URLSearchParams(from ?? "");
  const visible =
    from !== undefined && (Number(back.get("year")) || currentYear()) === year;
  const params = visible ? back : new URLSearchParams({ year: String(year) });
  return `/income?${withSaved(params, savedId)}`;
};
