import { GlobalProjectSelector } from "@/components/global-project-selector";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader({ title = "Dashboard", showProjectSelector = true }) {
  return (
    <header
      className="flex h-(--header-height) shrink-0 py-1 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-2xl font-bold py-2 px-2">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          {showProjectSelector ? <GlobalProjectSelector /> : null}
        </div>
      </div>
    </header>
  );
}
