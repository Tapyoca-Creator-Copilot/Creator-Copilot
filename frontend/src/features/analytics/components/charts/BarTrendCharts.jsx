import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  chartContainerClassName,
  defaultMargin,
  sharedXAxisProps,
} from "@/features/analytics/components/charts/chartPrimitives";

const buildBarChartProps = ({ data, barCategoryGap, barGap, maxBarSize }) => {
  const props = {
    data,
    margin: defaultMargin,
    barCategoryGap,
    accessibilityLayer: true,
  };

  if (typeof barGap === "number") props.barGap = barGap;
  if (typeof maxBarSize === "number") props.maxBarSize = maxBarSize;

  return props;
};

export const SingleSeriesTrendBarChart = ({
  data,
  dataKey = "amount",
  fill,
  barCategoryGap = "18%",
  maxBarSize = 44,
  cursorOpacity = 0.16,
  renderTooltipContent,
  renderXAxisTick,
  xAxisTicks,
}) => (
  <ResponsiveContainer width="100%" height="100%" className={chartContainerClassName}>
    <RechartsBarChart {...buildBarChartProps({ data, barCategoryGap, maxBarSize })}>
      <XAxis {...sharedXAxisProps} ticks={xAxisTicks} tick={renderXAxisTick} />
      <Tooltip
        wrapperStyle={{ outline: "none" }}
        isAnimationActive={false}
        cursor={{ fill: "var(--muted)", opacity: cursorOpacity }}
        content={renderTooltipContent}
      />
      <Bar
        dataKey={dataKey}
        fill={fill}
        radius={[7, 7, 2, 2]}
        isAnimationActive={true}
        animationDuration={700}
      />
    </RechartsBarChart>
  </ResponsiveContainer>
);

export const ComparisonTrendBarChart = ({
  data,
  firstDataKey = "earnings",
  firstFill,
  secondDataKey = "expenses",
  secondFill,
  barCategoryGap = "10%",
  barGap = 1,
  maxBarSize = null,
  cursorOpacity = 0.16,
  renderTooltipContent,
  renderXAxisTick,
  xAxisTicks,
}) => (
  <ResponsiveContainer width="100%" height="100%" className={chartContainerClassName}>
    <RechartsBarChart {...buildBarChartProps({ data, barCategoryGap, barGap, maxBarSize })}>
      <XAxis {...sharedXAxisProps} ticks={xAxisTicks} tick={renderXAxisTick} />
      <Tooltip
        wrapperStyle={{ outline: "none" }}
        isAnimationActive={false}
        cursor={{ fill: "var(--muted)", opacity: cursorOpacity }}
        content={renderTooltipContent}
      />
      <Bar
        dataKey={firstDataKey}
        fill={firstFill}
        radius={[6, 6, 2, 2]}
        isAnimationActive={true}
        animationDuration={700}
      />
      <Bar
        dataKey={secondDataKey}
        fill={secondFill}
        radius={[6, 6, 2, 2]}
        isAnimationActive={true}
        animationDuration={700}
      />
    </RechartsBarChart>
  </ResponsiveContainer>
);

export {
  ComparisonTrendAreaChart,
  SingleSeriesTrendAreaChart,
} from "@/features/analytics/components/charts/AreaTrendCharts";
