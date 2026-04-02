export const formatBudget = (amount, currency, options = {}) => {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return "—";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
      ...options,
    }).format(amount);
  } catch {
    return `${currency || "USD"} ${amount.toFixed(2)}`;
  }
};

export const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString();
};
