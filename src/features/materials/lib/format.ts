export function formatMoney(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits,
  });
}

export function formatNumber(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString("es-AR", { maximumFractionDigits });
}
