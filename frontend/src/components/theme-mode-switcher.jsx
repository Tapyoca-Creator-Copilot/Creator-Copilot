import { IconMoon, IconSun } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { SidebarMenuButton } from "@/components/ui/sidebar";

import { useTheme } from "next-themes";

export function ThemeModeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const isDarkMode = resolvedTheme === "dark";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <SidebarMenuButton
      type="button"
      onClick={() => setTheme(isDarkMode ? "light" : "dark")}
      className="cursor-pointer"
    >
      {isDarkMode ? <IconSun /> : <IconMoon />}
      {isDarkMode ? "Light Mode" : "Dark Mode"}
    </SidebarMenuButton>
  );
}