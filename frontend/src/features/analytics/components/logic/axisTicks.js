import { createElement } from "react";

export const createEdgeXAxisTickRenderer = (xAxisTicks) => {
  return ({ x, y, payload: tickPayload }) => {
    const label = tickPayload?.value;
    const firstLabel = xAxisTicks[0];
    const lastLabel = xAxisTicks[xAxisTicks.length - 1];
    let textAnchor = "middle";

    if (xAxisTicks.length > 1) {
      if (label === firstLabel) textAnchor = "start";
      else if (label === lastLabel) textAnchor = "end";
    }

    return createElement(
      "text",
      { x, y: y + 14, textAnchor, className: "fill-muted-foreground text-sm" },
      label
    );
  };
};
