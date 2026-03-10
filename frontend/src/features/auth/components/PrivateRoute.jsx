import { AssistantModal } from "@/components/assistant-ui/assistant-modal";
import { UserAuth } from "@/features/auth/context/AuthContext";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { AssistantChatTransport, useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Navigate } from "react-router-dom";




function AssistantRuntimeGate({ children }) {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}

const PrivateRoute = ({ children }) => {
    const { session, isAuthLoading } = UserAuth();

    if (isAuthLoading) {
        return <div className="p-6 text-sm text-muted-foreground">Checking session...</div>;
    }

    return <>{session ? <>
    <AssistantRuntimeGate>
      <AssistantModal/>
      {children}
    </AssistantRuntimeGate>
    </> : <Navigate to="/signin" replace />}</>;
};

export default PrivateRoute;