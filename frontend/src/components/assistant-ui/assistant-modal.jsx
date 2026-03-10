"use client";
import { AssistantModalPrimitive } from "@assistant-ui/react";
import { forwardRef } from "react";

import tapyIcon from "@/assets/tapy.png";
import { Thread } from "@/components/assistant-ui/thread";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";

export const AssistantModal = () => {
  return (
    <AssistantModalPrimitive.Root>
      <AssistantModalPrimitive.Anchor className="aui-root aui-modal-anchor fixed right-4 bottom-4 z-50 h-14 w-14">
        <AssistantModalPrimitive.Trigger asChild>
          <AssistantModalButton />
        </AssistantModalPrimitive.Trigger>
      </AssistantModalPrimitive.Anchor>
      <AssistantModalPrimitive.Content
        sideOffset={16}
        className="aui-root aui-modal-content data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:zoom-out data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-1/2 data-[state=open]:slide-in-from-right-1/2 data-[state=open]:zoom-in z-50 h-125 w-100 overflow-clip overscroll-contain rounded-xl border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=closed]:animate-out data-[state=open]:animate-in [&>.aui-thread-root]:bg-inherit [&>.aui-thread-root_.aui-thread-viewport-footer]:bg-inherit">
        <Thread />
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
};

const AssistantModalButton = forwardRef(({ "data-state": state, ...rest }, ref) => {
  const tooltip = state === "open" ? "Close Assistant" : "Open Tapy Assistant";

  return (
    <TooltipIconButton
      tooltip={tooltip}
      side="left"
      {...rest}
      className="aui-modal-button size-full rounded-none bg-transparent p-0 shadow-none transition-transform hover:scale-110 hover:bg-transparent active:scale-90"
      ref={ref}>
      <img
        src={tapyIcon}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="aui-modal-button-icon size-full rounded-none object-cover" />
    </TooltipIconButton>
  );
});

AssistantModalButton.displayName = "AssistantModalButton";
