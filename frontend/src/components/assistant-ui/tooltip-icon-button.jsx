"use client";;
import { Slot } from "radix-ui";
import { forwardRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const TooltipIconButton = forwardRef(({
  children,
  tooltip,
  side = "bottom",
  className,
  tooltipContentClassName,
  tooltipArrowClassName,
  tooltipDisableAnimation,
  ...rest
}, ref) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          {...rest}
          className={cn("aui-button-icon size-6 p-1", className)}
          ref={ref}>
          <Slot.Slottable>{children}</Slot.Slottable>
          <span className="aui-sr-only sr-only">{tooltip}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        disableAnimation={tooltipDisableAnimation}
        className={tooltipContentClassName}
        arrowClassName={tooltipArrowClassName}
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
});

TooltipIconButton.displayName = "TooltipIconButton";
