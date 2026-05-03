"use client";
import tapyIcon from "@/assets/tapy.png";
import { Thread } from "@/components/assistant-ui/thread";
import { Button } from "@/components/ui/button";
import { AssistantModalPrimitive, ThreadListItemPrimitive, ThreadListPrimitive } from "@assistant-ui/react";
import { Plus, Trash2 } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";

const MODAL_SIZE_CLASSES = {
  small: "md:w-[min(80vw,44rem)] md:h-[min(66vh,34rem)]",
  default: "md:w-[min(92vw,60rem)] md:h-[min(78vh,46rem)]",
  large: "md:w-[min(96vw,72rem)] md:h-[min(88vh,56rem)]",
};

const ASSISTANT_NUDGES = [
  "Ask Tapy about this project",
  "Need a quick budget read?",
  "I can summarize expenses",
  "Want help spotting profit signals?",
];

export const AssistantModal = () => {
  const [chatSize, setChatSize] = useState("default");
  const [nudgeIndex, setNudgeIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNudgeIndex((index) => (index + 1) % ASSISTANT_NUDGES.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <AssistantModalPrimitive.Root>
      <AssistantModalPrimitive.Anchor className="aui-root aui-modal-anchor fixed right-4 bottom-4 z-50 h-20 w-20 sm:right-4 sm:bottom-4">
        <AssistantModalPrimitive.Trigger asChild>
          <AssistantModalButton className="peer" />
        </AssistantModalPrimitive.Trigger>
        <AssistantNudge message={ASSISTANT_NUDGES[nudgeIndex]} />
      </AssistantModalPrimitive.Anchor>
      <AssistantModalPrimitive.Content
        sideOffset={16}
        className={`aui-root aui-modal-content data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:zoom-out data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-1/2 data-[state=open]:slide-in-from-right-1/2 data-[state=open]:zoom-in z-50 h-[78vh] w-[92vw] min-w-[18rem] min-h-96 max-w-[96vw] max-h-[90vh] overflow-hidden overscroll-contain rounded-xl border border-border bg-popover p-0 text-popover-foreground transition-[width,height] duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in [&>.aui-thread-root]:bg-inherit [&>.aui-thread-root_.aui-thread-viewport-footer]:bg-inherit ${MODAL_SIZE_CLASSES[chatSize]}`}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-border px-3">
            <span className="text-xs font-medium">Chat Size</span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant={chatSize === "small" ? "default" : "ghost"}
                className="h-7 px-2 text-xs"
                onClick={() => setChatSize("small")}
              >
                Small
              </Button>
              <Button
                type="button"
                size="sm"
                variant={chatSize === "default" ? "default" : "ghost"}
                className="h-7 px-2 text-xs"
                onClick={() => setChatSize("default")}
              >
                Default
              </Button>
              <Button
                type="button"
                size="sm"
                variant={chatSize === "large" ? "default" : "ghost"}
                className="h-7 px-2 text-xs"
                onClick={() => setChatSize("large")}
              >
                Large
              </Button>
            </div>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-[11rem_minmax(0,1fr)] md:grid-cols-[12rem_minmax(0,1fr)]">
            <ThreadHistorySidebar />
            <Thread />
          </div>
        </div>
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
};

const AssistantNudge = ({ message }) => {
  return (
    <div className="pointer-events-none absolute bottom-3 right-[5.25rem] hidden w-max max-w-56 items-center rounded-full border border-border/80 bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg shadow-black/5 transition-opacity duration-200 peer-data-[state=open]:hidden sm:flex">
      <span className="font-medium leading-none">{message}</span>
      <span className="absolute -right-1.5 top-1/2 size-3 -translate-y-1/2 rotate-45 border-r border-t border-border/80 bg-popover" />
    </div>
  );
};

const ThreadHistorySidebar = () => {
  return (
    <div className="min-h-0 border-r border-border dark:border-border p-2">
      <ThreadListPrimitive.Root className="flex h-full flex-col gap-2">
        <ThreadListPrimitive.New asChild className="bg-foreground text-secondary-foreground hover:bg-foreground/90 hover:text-secondary-foreground focus-visible:bg-foreground/90 focus-visible:text-secondary-foreground active:bg-foreground/90 active:text-secondary-foreground">
            <Button variant="outline" className="w-full justify-start text-sm">
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            New Chat
          </Button>
        </ThreadListPrimitive.New>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ThreadListPrimitive.Items components={{ ThreadListItem }} />
        </div>
      </ThreadListPrimitive.Root>
    </div>
  );
};

const ThreadListItem = () => {
  return (
    <ThreadListItemPrimitive.Root className="group relative mb-1 flex items-center rounded-md text-sm hover:bg-accent">
    <ThreadListItemPrimitive.Trigger className="flex-1 truncate py-1.5 pl-2 pr-7 text-left text-foreground">
        <ThreadListItemPrimitive.Title fallback="New Conversation" />
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemPrimitive.Delete asChild>
        <button
          className="absolute right-1 flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 data-active:opacity-100"
          aria-label="Delete conversation"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </ThreadListItemPrimitive.Delete>
    </ThreadListItemPrimitive.Root>
  );
};

const AssistantModalButton = forwardRef(({ "data-state": state, ...rest }, ref) => {
  return (
    <button
      type="button"
      aria-label={state === "open" ? "Close assistant" : "Open assistant"}
      {...rest}
      className="aui-modal-button size-full rounded-none bg-transparent p-0 transition-transform hover:scale-110 hover:!bg-transparent dark:hover:!bg-transparent focus-visible:!ring-0 focus-visible:!border-transparent active:scale-90"
      ref={ref}>
      <img
        src={tapyIcon}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="aui-modal-button-icon size-full rounded-none object-cover" />
    </button>
  );
});

AssistantModalButton.displayName = "AssistantModalButton";
