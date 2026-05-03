import { currencyFormatter } from "@/features/analytics/utils/formatters";

export const buildProfitInsightCopy = ({ chartData, activePoint, percentageChange, absoluteChange, currency }) => {
  const hasProfitData = chartData.some((item) => item.earnings > 0 || item.expenses > 0);

  if (!hasProfitData) {
    return {
      title: "No profit activity in this range",
      body: "There are no earnings or expenses in the selected period yet. Once entries are added, this section will summarize profit movement.",
      action: "Add dated earnings and expenses to see project profitability over time.",
      direction: "neutral",
    };
  }

  const firstProfit = chartData[0]?.profit ?? 0;
  const latestProfit = chartData[chartData.length - 1]?.profit ?? firstProfit;
  const overallChange = latestProfit - firstProfit;
  const overallDirection = overallChange > 0 ? "upward" : overallChange < 0 ? "downward" : "stable";
  const trendSentence =
    overallDirection === "upward"
      ? "Across the full selected range, net profit is still improving, which means earnings are gaining ground against expenses."
      : overallDirection === "downward"
        ? "Across the full selected range, net profit is still declining, which means expenses are gaining ground against earnings."
        : "Across the full selected range, net profit is holding steady, with no major shift between earnings and expenses.";

  if (!activePoint || Number.isNaN(percentageChange) || Number.isNaN(absoluteChange)) {
    return {
      title: "Profit trend summary",
      body: `${trendSentence} The latest net profit point is ${currencyFormatter(latestProfit, currency)}.`,
      direction:
        overallDirection === "upward"
          ? "up"
          : overallDirection === "downward"
            ? "down"
            : "flat",
      action:
        latestProfit >= 0
          ? "Keep watching whether earnings continue to cover new expenses."
          : "Review upcoming earnings or high expense periods to understand the path back to break-even.",
    };
  }

  const label = activePoint?.date || "this period";
  const profit = Number(activePoint?.profit || 0);

  if (absoluteChange === 0) {
    return {
      title: `Flat profit in ${label}`,
      body: `Net profit is holding close to the prior period at ${currencyFormatter(profit, currency)}. ${trendSentence}`,
      action: "No immediate action is required, but keep comparing earnings and expenses as new entries arrive.",
      direction: "flat",
    };
  }

  if (absoluteChange > 0) {
    return {
      title: `Profit improved in ${label}`,
      body: `Net profit increased by ${currencyFormatter(Math.abs(absoluteChange), currency)} (${percentageChange.toFixed(
        1
      )}%) versus the previous period, bringing this point to ${currencyFormatter(profit, currency)}. ${trendSentence}`,
      direction: "up",
      action:
        profit >= 0
          ? "This is a healthy signal. Look at which earning sources or reduced expenses drove the improvement."
          : "The project is still below break-even here, but the direction is improving.",
    };
  }

  return {
    title: `Profit decreased in ${label}`,
    body: `Net profit decreased by ${currencyFormatter(Math.abs(absoluteChange), currency)} (${Math.abs(
      percentageChange
    ).toFixed(1)}%) compared with the prior period, bringing this point to ${currencyFormatter(profit, currency)}. ${trendSentence}`,
    direction: "down",
    action:
      profit >= 0
        ? "Profit remains positive, but review whether expense growth is starting to narrow the cushion."
        : "This period is below break-even. Check whether lower earnings or higher expenses caused the change.",
  };
};
