import { useNavigate } from 'react-router-dom';

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserAuth } from '@/features/auth/context/AuthContext';

const Dashboard = () => {
  const { session } = UserAuth();
  const navigate = useNavigate();
  
  const full_name = session?.user?.user_metadata?.full_name || session?.user?.email;
  const occupation = session?.user?.user_metadata?.occupation || "User";

  return (
    <SidebarProvider style={{ "--sidebar-width": "260px" }}>
      <AppSidebar variant="inset"/>
      <SidebarInset>
        <SiteHeader title="Overview" />
          <div className="p-8">
            <div className="space-y-4 mt-4">
              <p>Welcome, {full_name}! Role: {occupation}.</p>
              <p>This page is your quick overview. Open Projects to manage project details or Expenses to track spending.</p>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  type="button"
                  className="w-full rounded-md border border-input/50 p-3 text-left hover:bg-accent"
                  onClick={() => navigate("/projects")}>
                  <p className="font-semibold">Go to Projects</p>
                  <p className="text-sm text-muted-foreground">View all projects and open project details.</p>
                </button>
                <button
                  type="button"
                  className="w-full rounded-md border border-input/50 p-3 text-left hover:bg-accent"
                  onClick={() => navigate("/expenses")}>
                  <p className="font-semibold">Go to Expenses</p>
                  <p className="text-sm text-muted-foreground">Track transactions and filter by department.</p>
                </button>
              </CardContent>
            </Card>
          </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Dashboard;