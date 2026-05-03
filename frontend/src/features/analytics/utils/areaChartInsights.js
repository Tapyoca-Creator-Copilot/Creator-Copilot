import { currencyFormatter } from "@/features/analytics/utils/formatters";

const classNames = (...classes) => classes.filter(Boolean).join(" ");

export const formatChange = (payload, percentageChange, absoluteChange, currency = "USD") => {
  if (!payload || Number.isNaN(percentageChange)) {
    return "--";
  }

  const formattedPercentage = `${percentageChange > 0 ? "+" : ""}${percentageChange.toFixed(1)}%`;
  const formattedAbsolute = `${absoluteChange >= 0 ? "+" : "-"}${currencyFormatter(
    Math.abs(absoluteChange),
    currency
  )}`;

  return `${formattedPercentage} (${formattedAbsolute})`;
};

export const getChangeColorClass = (payload, percentageChange) => {
  if (!payload || Number.isNaN(percentageChange)) {
    return "text-muted-foreground";
  }

  if (percentageChange > 0) {
    return "text-area-chart-earning-stroke";
  }

  return "text-area-chart-expense-stroke";
};

export const getInsightCopy = (
  chartData,
  payload,
  percentageChange,
  absoluteChange,
  timeRangeLabel,
  currency = "USD",
  options = {}
) => {
  const {
    pluralLabel = "Expenses",
    singularLabel = "expense",
    emptyBody = "There are no expense entries in the selected period yet. Once transactions are added, this section will summarize the trend direction and highlight any budget pressure.",
    emptyAction = "Try switching to a longer range if you want to inspect a broader expense pattern.",
    upwardSummary = "Expenses are trending upward across the selected period, which may indicate growing project activity.",
    downwardSummary = "Expenses are easing across the selected period, which may reflect fewer new charges or a slowdown in activity.",
    stableSummary = "Expenses are holding steady across the selected period, with no major shift in monthly outflow.",
    upwardTrend = "Expenses are trending upward across the period, suggesting the project is becoming more active over time.",
    downwardTrend = "Expenses have eased over the period, which may indicate fewer new entries or a slowdown in activity.",
    stableTrend = "Expenses have remained relatively steady across the period, with no major shift in monthly outflow.",
    increasedTitle = "Expenses picked up",
    decreasedTitle = "Expenses decreased",
    increasedVerb = "increased",
    decreasedVerb = "decreased",
    positiveAction = "This pace could increase budget pressure next month. Review recent entries for larger or recurring costs.",
    moderatePositiveAction = "This looks like a moderate increase; check whether the change aligns with planned project activity.",
    negativeAction = "If this slowdown is intentional, the project may have more room in the budget. Confirm planned costs are still scheduled.",
    moderateNegativeAction = "This is a mild decline; keep monitoring to see whether the slower pace continues.",
    stableAction = "No immediate action is required, but continue monitoring upcoming expense entries.",
  } = options;

  if (!payload || Number.isNaN(percentageChange) || Number.isNaN(absoluteChange)) {
    const hasData = chartData.some((item) => item.amount > 0);

    if (!hasData) {
      return {
        title: `No ${singularLabel} data recorded in this ${timeRangeLabel}`,
        body: emptyBody,
        action: emptyAction,
        direction: "neutral",
      };
    }

    const firstValue = chartData[0]?.amount ?? 0;
    const latestValue = chartData[chartData.length - 1]?.amount ?? firstValue;
    const overallChange = latestValue - firstValue;
    const overallDirection = overallChange > 0 ? "upward" : overallChange < 0 ? "downward" : "stable";
    const summarySentence =
      overallDirection === "upward"
        ? upwardSummary
        : overallDirection === "downward"
          ? downwardSummary
          : stableSummary;

    return {
      title: `Trend summary for this ${timeRangeLabel}`,
      body: `${summarySentence} The latest data point sits at ${currencyFormatter(latestValue, currency)}, giving you a quick read on how the range is moving overall.`,
      direction:
        overallDirection === "upward"
          ? "up"
          : overallDirection === "downward"
            ? "down"
            : "flat",
      action:
        overallDirection === "upward"
          ? "Watch the next entries closely if you want to avoid budget pressure building later in the period."
          : overallDirection === "downward"
            ? "This slower pace could free up room in the budget if the slowdown is intentional."
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
      ? upwardTrend
      : overallDirection === "downward"
        ? downwardTrend
        : stableTrend;

  if (absoluteChange === 0) {
    return {
      title: `Flat trend in ${month}`,
      body: `The hovered month is holding close to the prior period at ${currencyFormatter(value, currency)}. ${trendSentence}`,
      direction: "flat",
      action:
        overallDirection === "upward"
          ? "Keep an eye on the next few months in case the current pace continues."
          : stableAction,
    };
  }

  if (absoluteChange > 0) {
    return {
      title: `${increasedTitle} in ${month}`,
      body: `${pluralLabel} ${increasedVerb} by ${currencyFormatter(Math.abs(absoluteChange), currency)} (${percentageChange.toFixed(
        1
      )}%) versus the previous month, bringing the hovered month to ${currencyFormatter(value, currency)}. ${trendSentence}`,
      direction: "up",
      action:
        percentageChange > 15
          ? positiveAction
          : moderatePositiveAction,
    };
  }

  return {
    title: `${decreasedTitle} in ${month}`,
    body: `${pluralLabel} ${decreasedVerb} by ${currencyFormatter(Math.abs(absoluteChange), currency)} (${Math.abs(
      percentageChange
    ).toFixed(1)}%) compared with the prior month, bringing the hovered month to ${currencyFormatter(value, currency)}. ${trendSentence}`,
    direction: "down",
    action:
      percentageChange < -15
        ? negativeAction
        : moderateNegativeAction,
  };
};

export const cx = classNames;
