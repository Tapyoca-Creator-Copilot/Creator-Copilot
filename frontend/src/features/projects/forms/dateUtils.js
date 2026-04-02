const pad2 = (value) => String(value).padStart(2, "0");

export const formatLocalYmd = (value) => {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

export const parseLocalYmd = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const parts = value.split("-").map((part) => Number(part));
  if (parts.length !== 3) {
    return null;
  }

  const [year, month, day] = parts;
  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

export const formatDateLabel = (value) => {
  if (!value) {
    return "Pick a date";
  }

  const date = value instanceof Date ? value : parseLocalYmd(value) || new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Pick a date";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
