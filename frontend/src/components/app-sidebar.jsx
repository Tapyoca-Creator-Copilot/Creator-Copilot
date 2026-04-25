import {
  IconArchive,
  IconChartBar,
  IconFileImport,
  IconFolder,
  IconLayoutDashboard,
  IconMoneybagMinus,
  IconMoneybagPlus,
  IconSettings,
} from "@tabler/icons-react";

import tapyocaLogo from "@/assets/tapyoca-logo-clean.svg";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { ThemeModeSwitcher } from "@/components/theme-mode-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserAuth } from "@/features/auth/context/AuthContext";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconLayoutDashboard,
    },
    {
      title: "Earnings",
      url: "/earnings",
      icon: IconMoneybagPlus,
    },
    {
      title: "Expenses",
      url: "/expenses",
      icon: IconMoneybagMinus,
    },
    {
      title: "Graphs",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: IconFolder,
    },
    {
      title: "Archived Projects",
      url: "/projects/archived",
      icon: IconArchive,
    },
    {
      title: "Import Data",
      url: "/import-data",
      icon: IconFileImport,
    },
  ],
  navSecondary: [
    {
      title: "Theme",
      component: ThemeModeSwitcher,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const { session } = UserAuth();

  const user = {
    name:
      session?.user?.user_metadata?.full_name ||
      session?.user?.email?.split("@")[0] ||
      "User",
    email: session?.user?.email || "",
    avatar:
      session?.user?.user_metadata?.avatar_url ||
      session?.user?.user_metadata?.picture ||
      "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-auto p-1.5 hover:bg-transparent hover:text-sidebar-foreground active:bg-transparent active:text-sidebar-foreground">
              <a href="#" className="pointer-events-none flex w-full cursor-default select-none items-center justify-between gap-2">
                <span className="min-w-0 flex flex-col">
                  <span className="text-xl font-medium leading-tight">Creator Copilot</span>
                  <span className="p-0.5 flex items-center gap-1 text-xs leading-tight text-sidebar-foreground/80">
                    <span>powered by</span>
                    <img src={tapyocaLogo} alt="Tapyoca" className="h-3 mt-1 w-auto shrink-0" />
                  </span>
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}