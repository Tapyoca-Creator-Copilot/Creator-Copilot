import { AssistantModal } from "@/components/assistant-ui/assistant-modal";
import { AssistantStatePersistence } from "@/components/assistant-ui/assistant-state-persistence";
import { SupabaseThreadListAdapter } from "@/components/assistant-ui/supabase-thread-list-adapter";
import { UserAuth } from "@/features/auth/context/AuthContext";
import { useChat } from "@ai-sdk/react";
import { AssistantRuntimeProvider, unstable_useRemoteThreadListRuntime, useAuiState } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useAISDKRuntime,
} from "@assistant-ui/react-ai-sdk";
import { useMemo } from "react";
import { Navigate } from "react-router-dom";

const supabaseAdapter = new SupabaseThreadListAdapter();

const aiServerBaseUrl = import.meta.env.VITE_AI_SERVER_URL;
const chatApiUrl = aiServerBaseUrl ? `${aiServerBaseUrl.replace(/\/$/, "")}/api/chat` : "/api/chat";

function RuntimeHook() {
  const id = useAuiState((s) => s.threadListItem.id);
  const transport = useMemo(() => new AssistantChatTransport({ api: chatApiUrl }), []);
  const chat = useChat({ id, transport });
  const runtime = useAISDKRuntime(chat);
  transport.setRuntime(runtime);
  return runtime;
}

function AssistantRuntimeGate({ children, userId }) {
  const runtime = unstable_useRemoteThreadListRuntime({
    runtimeHook: RuntimeHook,
    adapter: supabaseAdapter,
    allowNesting: true,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantStatePersistence userId={userId} />
      {children}
    </AssistantRuntimeProvider>
  );
}

const PrivateRoute = ({ children }) => {
  const { session, isAuthLoading } = UserAuth();

  if (isAuthLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Checking session...
      </div>
    );
  }

  return (
    <>
      {session ? (
        <>
          <AssistantRuntimeGate userId={session.user.id}>
            <AssistantModal />
            {children}
          </AssistantRuntimeGate>
        </>
      ) : (
        <Navigate to="/signin" replace />
      )}
    </>
  );
};

export default PrivateRoute;
