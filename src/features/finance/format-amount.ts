export function formatFinanceAmount(value: number) {
  return Math.round(value).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}
