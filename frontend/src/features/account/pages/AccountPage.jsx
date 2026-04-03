import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserAuth } from "@/features/auth/context/AuthContext";

const getInitials = (name) => {
  if (!name) {
    return "U";
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return initials || "U";
};

const AccountPage = () => {
  const { session } = UserAuth();
  const user = session?.user;

  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Account User";
  const email = user?.email || "No email available";
  const avatarUrl = user?.user_metadata?.avatar_url || "";
  const initials = getInitials(fullName);

  return (
    <SidebarProvider style={{ "--sidebar-width": "260px" }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Account" />
        <div className="p-6 md:p-8">
          <div className="mx-auto w-full max-w-4xl space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Account</h2>
              <p className="mt-1 text-muted-foreground">
                This page is ready for future account tools like profile photo updates and password changes.
              </p>
            </div>

            <Card className="border-black/5 dark:border-white/10">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Preview your account identity and prepare space for profile image editing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <Avatar className="h-20 w-20 rounded-xl border border-black/10 dark:border-white/15">
                    <AvatarImage src={avatarUrl} alt={fullName} />
                    <AvatarFallback className="rounded-xl text-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <p className="font-medium">{fullName}</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                    <Button type="button" variant="outline" disabled>
                      Change profile photo (coming soon)
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="account-name">Account name</Label>
                    <Input id="account-name" value={fullName} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-email">Account email</Label>
                    <Input id="account-email" value={email} readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-black/5 dark:border-white/10">
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Password and security management will live here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button type="button" disabled>
                  Change password (coming soon)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AccountPage;