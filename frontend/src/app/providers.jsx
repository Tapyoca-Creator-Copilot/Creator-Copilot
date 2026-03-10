import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthContextProvider } from "@/features/auth/context/AuthContext";
import { Toaster } from "sonner";

export function AppProviders({ children }) {
  return (
    <AuthContextProvider>
      <TooltipProvider delayDuration={0}>
        {children}
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </AuthContextProvider>
  );
}
