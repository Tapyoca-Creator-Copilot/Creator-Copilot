import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const SettingsPage = () => {
  return (
    <SidebarProvider style={{ "--sidebar-width": "260px" }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Settings" />
        <div className="p-6 md:p-8">
          <div className="mx-auto w-full max-w-3xl space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
              <p className="mt-1 text-muted-foreground">
                Manage your profile, preferences, and account-related options.
              </p>
            </div>

            <Card className="border-black/5 dark:border-white/10">
              <CardHeader>
                <CardTitle>Profile & Preferences</CardTitle>
                <CardDescription>
                  This section is reserved for account configuration and personal settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  More account tools can be added here, such as profile editing, notification preferences, and security options.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SettingsPage;