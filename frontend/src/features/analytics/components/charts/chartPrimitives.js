export const defaultMargin = { top: 8, right: 0, bottom: 0, left: 0 };

export const chartContainerClassName =
  "[&_.recharts-layer]:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none";

export const sharedXAxisProps = {
  dataKey: "date",
  interval: 0,
  allowDuplicatedCategory: false,
  padding: { left: 0, right: 0 },
  tickLine: false,
  axisLine: false,
  minTickGap: 0,
};
