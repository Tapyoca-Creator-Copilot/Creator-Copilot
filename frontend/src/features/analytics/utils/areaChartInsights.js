import { currencyFormatter } from "@/features/analytics/utils/formatters";

const classNames = (...classes) => classes.filter(Boolean).join(" ");

export const formatChange = (payload, percentageChange, absoluteChange) => {
  if (!payload || Number.isNaN(percentageChange)) {
    return "--";
  }

  const formattedPercentage = `${percentageChange > 0 ? "+" : ""}${percentageChange.toFixed(1)}%`;
  const formattedAbsolute = `${absoluteChange >= 0 ? "+" : "-"}${currencyFormatter(
    Math.abs(absoluteChange)
  )}`;

  return `${formattedPercentage} (${formattedAbsolute})`;
};

export const getChangeColorClass = (payload, percentageChange) => {
  if (!payload || Number.isNaN(percentageChange)) {
    return "text-muted-foreground";
  }

  if (percentageChange > 0) {
    return "text-emerald-700 dark:text-emerald-500";
  }

  return "text-red-700 dark:text-red-500";
};

export const getInsightCopy = (chartData, payload, percentageChange, absoluteChange, timeRangeLabel) => {
  if (!payload || Number.isNaN(percentageChange) || Number.isNaN(absoluteChange)) {
    const hasSpending = chartData.some((item) => item.amount > 0);

    if (!hasSpending) {
      return {
        title: `No spending recorded in this ${timeRangeLabel}`,
        body:
          "There are no expense entries in the selected period yet. Once transactions are added, this section will summarize the trend direction and highlight any budget pressure.",
        action: "Try switching to a longer range if you want to inspect a broader spending pattern.",
      };
    }

    const firstValue = chartData[0]?.amount ?? 0;
    const latestValue = chartData[chartData.length - 1]?.amount ?? firstValue;
    const overallChange = latestValue - firstValue;
    const overallDirection = overallChange > 0 ? "upward" : overallChange < 0 ? "downward" : "stable";
    const summarySentence =
      overallDirection === "upward"
        ? "Spending is trending upward across the selected period, which may indicate growing project activity."
        : overallDirection === "downward"
          ? "Spending is easing across the selected period, which may reflect fewer new charges or a slowdown in activity."
          : "Spending is holding steady across the selected period, with no major shift in monthly outflow.";

    return {
      title: `Trend summary for this ${timeRangeLabel}`,
      body: `${summarySentence} The latest data point sits at ${currencyFormatter(latestValue)}, giving you a quick read on how the range is moving overall.`,
      action:
        overallDirection === "upward"
          ? "Watch the next entries closely if you want to avoid budget pressure building later in the period."
          : overallDirection === "downward"
            ? "This softer pace could free up room in the budget if the slowdown is intentional."
            : "Continue monitoring new entries to confirm the project remains on a stable path.",
    };
  }

  const month = payload?.payload?.date || "this month";
  const value = payload?.value ?? payload?.payload?.[payload?.dataKey] ?? 0;
  const latestValue = chartData[chartData.length - 1]?.amount ?? value;
  const firstValue = chartData[0]?.amount ?? value;
  const overallChange = latestValue - firstValue;
  const overallDirection = overallChange > 0 ? "upward" : overallChange < 0 ? "downward" : "stable";
  const trendSentence =
    overallDirection === "upward"
      ? "Spending is trending upward across the period, suggesting the project is becoming more active over time."
      : overallDirection === "downward"
        ? "Spending has eased over the period, which may indicate fewer new expense entries or a slowdown in activity."
        : "Spending has remained relatively steady across the period, with no major shift in monthly outflow.";

  if (absoluteChange === 0) {
    return {
      title: `Flat trend in ${month}`,
      body: `The hovered month is holding close to the prior period at ${currencyFormatter(value)}. ${trendSentence}`,
      action:
        overallDirection === "upward"
          ? "Keep an eye on the next few months in case the current pace continues."
          : "No immediate action is required, but continue monitoring upcoming expense entries.",
    };
  }

  if (absoluteChange > 0) {
    return {
      title: `Spending picked up in ${month}`,
      body: `Expenses increased by ${currencyFormatter(Math.abs(absoluteChange))} (${percentageChange.toFixed(
        1
      )}%) versus the previous month, bringing the hovered month to ${currencyFormatter(value)}. ${trendSentence}`,
      action:
        percentageChange > 15
          ? "This pace could increase budget pressure next month. Review recent entries for larger or recurring costs."
          : "This looks like a moderate increase; check whether the change aligns with planned project activity.",
    };
  }

  return {
    title: `Spending cooled in ${month}`,
    body: `Expenses decreased by ${currencyFormatter(Math.abs(absoluteChange))} (${Math.abs(
      percentageChange
    ).toFixed(1)}%) compared with the prior month, bringing the hovered month to ${currencyFormatter(value)}. ${trendSentence}`,
    action:
      percentageChange < -15
        ? "If this slowdown is intentional, the project may have more room in the budget. Confirm planned costs are still scheduled."
        : "This is a mild decline; keep monitoring to see whether the softer pace continues.",
  };
};

export const cx = classNames;
