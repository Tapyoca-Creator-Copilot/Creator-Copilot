export const getFileKey = (file) => `${file.name}__${file.size}__${file.lastModified}`;

export const isCsvFile = (file) => file.name.toLowerCase().endsWith(".csv");

export const splitCsvRow = (row) => {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i += 1) {
    const char = row[i];
    const next = row[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

export const getCsvHeaders = (csvText) => {
  const firstLine = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  if (!firstLine) {
    return [];
  }

  const headers = splitCsvRow(firstLine)
    .map((header) => header.replace(/^"|"$/g, "").trim())
    .filter(Boolean);

  return [...new Set(headers)];
};

export const parseCsvRecords = (csvText) => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvRow(lines[0]).map((header) => header.replace(/^"|"$/g, "").trim());
  const records = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = splitCsvRow(lines[i]).map((value) => value.replace(/^"|"$/g, "").trim());
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    records.push(row);
  }

  return records;
};

export const parseAmount = (value) => {
  const normalized = String(value ?? "")
    .replace(/[,$\s]/g, "")
    .trim();
  return Number.parseFloat(normalized);
};

export const normalizeDate = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
};
