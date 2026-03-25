import { supabase } from "@/supabaseClient";
import { useAssistantRuntime, useAuiState } from "@assistant-ui/react";
import { useEffect, useRef } from "react";

const loadThreadState = async (remoteId) => {
  const { data, error } = await supabase
    .from("chat_threads")
    .select("state")
    .eq("id", remoteId)
    .single();

  if (error || !data?.state) return null;
  return data.state;
};

const saveThreadState = async (remoteId, state) => {
  await supabase
    .from("chat_threads")
    .update({ state })
    .eq("id", remoteId);
};

export const AssistantStatePersistence = ({ userId: _userId }) => {
  const runtime = useAssistantRuntime();
  const threadRemoteId = useAuiState((s) => s.threadListItem.remoteId);
  const messageCount = useAuiState((s) => s.thread.messages.length);
  const isRunning = useAuiState((s) => s.thread.isRunning);

  const hydratedRemoteIdRef = useRef(null);
  const persistTimeoutRef = useRef(null);

  // Hydrate messages when switching to a thread that has a remoteId.
  useEffect(() => {
    if (!threadRemoteId || !runtime) return;
    if (hydratedRemoteIdRef.current === threadRemoteId) return;

    hydratedRemoteIdRef.current = threadRemoteId;

    loadThreadState(threadRemoteId).then((state) => {
      if (state && hydratedRemoteIdRef.current === threadRemoteId) {
        runtime.thread.importExternalState(state);
      }
    });

    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
        persistTimeoutRef.current = null;
      }
    };
  }, [runtime, threadRemoteId]);

  // Debounced save whenever messages change.
  useEffect(() => {
    if (!threadRemoteId || !runtime) return;
    if (hydratedRemoteIdRef.current !== threadRemoteId) return;
    if (messageCount === 0) return;

    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }

    persistTimeoutRef.current = setTimeout(() => {
      const state = runtime.thread.exportExternalState();
      saveThreadState(threadRemoteId, state);
      persistTimeoutRef.current = null;
    }, isRunning ? 350 : 120);

    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
        persistTimeoutRef.current = null;
      }
    };
  }, [runtime, threadRemoteId, messageCount, isRunning]);

  return null;
};
