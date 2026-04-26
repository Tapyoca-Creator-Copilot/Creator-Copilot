import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthContextProvider } from "@/features/auth/context/AuthContext";
import { ActiveProjectProvider } from "@/features/projects/context/ActiveProjectContext";
import { Toaster } from "sonner";

export function AppProviders({ children }) {
  return (
    <AuthContextProvider>
      <ActiveProjectProvider>
        <ThemeProvider>
          <TooltipProvider delayDuration={0}>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </ActiveProjectProvider>
    </AuthContextProvider>
  );
}
