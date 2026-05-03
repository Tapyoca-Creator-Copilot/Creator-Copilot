export const calculatePointChange = ({ chartData, payload, value }) => {
  if (!payload || !payload?.dataKey || typeof value !== "number") {
    return { percentageChange: Number.NaN, absoluteChange: Number.NaN };
  }

  const previousIndex = chartData.findIndex((item) => item.date === payload?.payload?.date);
  const previousValues = previousIndex > 0 ? chartData[previousIndex - 1] : {};
  const previousValue = previousValues?.[payload.dataKey];

  if (typeof previousValue !== "number" || previousValue === 0) {
    return { percentageChange: Number.NaN, absoluteChange: Number.NaN };
  }

  return {
    percentageChange: ((value - previousValue) / previousValue) * 100,
    absoluteChange: value - previousValue,
  };
};

export const calculateProfitChange = ({ chartData, activePoint }) => {
  if (!activePoint || typeof activePoint.profit !== "number") {
    return { percentageChange: Number.NaN, absoluteChange: Number.NaN };
  }

  const previousIndex = chartData.findIndex((item) => item.date === activePoint.date);
  const previousPoint = previousIndex > 0 ? chartData[previousIndex - 1] : null;
  const previousValue = previousPoint?.profit;

  if (typeof previousValue !== "number" || previousValue === 0) {
    return { percentageChange: Number.NaN, absoluteChange: Number.NaN };
  }

  return {
    percentageChange: ((activePoint.profit - previousValue) / Math.abs(previousValue)) * 100,
    absoluteChange: activePoint.profit - previousValue,
  };
};

export const getEdgeXAxisTicks = (chartData) => {
  if (!chartData.length) return [];
  const first = chartData[0]?.date;
  const last = chartData[chartData.length - 1]?.date;
  if (!first) return [];
  if (!last || first === last) return [first];
  return [first, last];
};
