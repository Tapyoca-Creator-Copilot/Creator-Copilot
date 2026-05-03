import {
  Area,
  AreaChart as RechartsAreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  chartContainerClassName,
  defaultMargin,
  sharedXAxisProps,
} from "@/features/analytics/components/charts/chartPrimitives";

export const SingleSeriesTrendAreaChart = ({
  data,
  dataKey = "amount",
  fill,
  stroke,
  renderTooltipContent,
  renderXAxisTick,
  xAxisTicks,
}) => (
  <ResponsiveContainer width="100%" height="100%" className={chartContainerClassName}>
    <RechartsAreaChart data={data} margin={defaultMargin} accessibilityLayer>
      <defs>
        <linearGradient id="singleSeriesDailyAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity={0.36} />
          <stop offset="70%" stopColor={fill} stopOpacity={0.1} />
          <stop offset="100%" stopColor={fill} stopOpacity={0.02} />
        </linearGradient>
      </defs>

      <XAxis {...sharedXAxisProps} ticks={xAxisTicks} tick={renderXAxisTick} />

      <Tooltip
        wrapperStyle={{ outline: "none" }}
        isAnimationActive={false}
        cursor={{ stroke: "var(--area-chart-cursor)", strokeWidth: 1 }}
        content={renderTooltipContent}
      />

      <Area
        type="monotone"
        dataKey={dataKey}
        stroke={stroke}
        strokeWidth={2.5}
        fill="url(#singleSeriesDailyAreaFill)"
        isAnimationActive={true}
        animationDuration={700}
        activeDot={{ r: 5, fill: stroke, stroke: "var(--card)", strokeWidth: 2 }}
      />
    </RechartsAreaChart>
  </ResponsiveContainer>
);

export const ComparisonTrendAreaChart = ({
  data,
  firstDataKey = "earnings",
  firstFill,
  firstStroke,
  secondDataKey = "expenses",
  secondFill,
  secondStroke,
  renderTooltipContent,
  renderXAxisTick,
  xAxisTicks,
}) => (
  <ResponsiveContainer width="100%" height="100%" className={chartContainerClassName}>
    <RechartsAreaChart data={data} margin={defaultMargin} accessibilityLayer>
      <defs>
        <linearGradient id="comparisonDailyFirstAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={firstFill} stopOpacity={0.2} />
          <stop offset="70%" stopColor={firstFill} stopOpacity={0.05} />
          <stop offset="100%" stopColor={firstFill} stopOpacity={0.01} />
        </linearGradient>
        <linearGradient id="comparisonDailySecondAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={secondFill} stopOpacity={0.18} />
          <stop offset="70%" stopColor={secondFill} stopOpacity={0.045} />
          <stop offset="100%" stopColor={secondFill} stopOpacity={0.01} />
        </linearGradient>
      </defs>

      <XAxis {...sharedXAxisProps} ticks={xAxisTicks} tick={renderXAxisTick} />

      <Tooltip
        wrapperStyle={{ outline: "none" }}
        isAnimationActive={false}
        cursor={{ stroke: "var(--area-chart-cursor)", strokeWidth: 1 }}
        content={renderTooltipContent}
      />

      <Area
        type="monotone"
        dataKey={firstDataKey}
        stroke={firstStroke}
        strokeWidth={2.5}
        fill="url(#comparisonDailyFirstAreaFill)"
        isAnimationActive={true}
        animationDuration={700}
        activeDot={{ r: 5, fill: firstStroke, stroke: "var(--card)", strokeWidth: 2 }}
      />
      <Area
        type="monotone"
        dataKey={secondDataKey}
        stroke={secondStroke}
        strokeWidth={2.5}
        fill="url(#comparisonDailySecondAreaFill)"
        isAnimationActive={true}
        animationDuration={700}
        activeDot={{ r: 5, fill: secondStroke, stroke: "var(--card)", strokeWidth: 2 }}
      />
    </RechartsAreaChart>
  </ResponsiveContainer>
);
