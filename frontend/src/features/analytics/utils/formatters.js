export const currencyFormatter = (value, currency = "USD", options = {}) => {
  const amount = Number(value) || 0;
  const maximumFractionDigits =
    typeof options.maximumFractionDigits === "number" ? options.maximumFractionDigits : 0;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits,
    }).format(amount);
  } catch {
    const fallbackCurrency = currency || "USD";
    return `${fallbackCurrency} ${amount.toFixed(Math.min(Math.max(maximumFractionDigits, 0), 20))}`;
  }
};
