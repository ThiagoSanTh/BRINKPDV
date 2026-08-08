export type SaleItem = {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number;
};

export function normalizeSaleItems(items: unknown): SaleItem[] {
  if (!items) {
    return [];
  }

  const parsed = typeof items === "string"
    ? (() => {
        try {
          return JSON.parse(items);
        } catch {
          return [];
        }
      })()
    : items;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((item) => ({
      productId: typeof item?.productId === "string" ? item.productId : undefined,
      name: String(item?.name ?? ""),
      quantity: Number(item?.quantity ?? 0),
      price: Number(item?.price ?? 0),
      discount: Number(item?.discount ?? 0),
    }))
    .filter((item) => item.name.length > 0);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDateLabel(date: string | Date) {
  return new Date(date).toLocaleDateString("pt-BR");
}
