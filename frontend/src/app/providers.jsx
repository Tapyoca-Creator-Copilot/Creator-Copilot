import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthContextProvider } from "@/features/auth/context/AuthContext";
import { Toaster } from "sonner";

export function AppProviders({ children }) {
  return (
    <AuthContextProvider>
      <ThemeProvider>
        <TooltipProvider delayDuration={0}>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </ThemeProvider>
    </AuthContextProvider>
  );
}
