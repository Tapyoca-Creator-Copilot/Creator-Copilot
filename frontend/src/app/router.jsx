import { createBrowserRouter } from "react-router-dom";

import AccountPage from "@/features/account/pages/AccountPage";
import PrivateRoute from "@/features/auth/components/PrivateRoute";
import Signin from "@/features/auth/pages/Signin";
import Signup from "@/features/auth/pages/Signup";
import Dashboard from "@/features/dashboard/pages/Dashboard";
import Earnings from "@/features/dashboard/pages/Earnings";
import Expenses from "@/features/dashboard/pages/Expenses";
import ImportDataPage from "@/features/import-data/pages/ImportDataPage";
import ArchivedProjectsPage from "@/features/projects/pages/ArchivedProjectsPage";
import CreateProjectPage from "@/features/projects/pages/CreateProjectPage";
import ProjectDetailPage from "@/features/projects/pages/ProjectDetailPage";
import ProjectsPage from "@/features/projects/pages/ProjectsPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";

export const appRouter = createBrowserRouter([
  { path: "/", element: <Signup /> },
  { path: "/signup", element: <Signup /> },
  { path: "/signin", element: <Signin /> },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/projects",
    element: (
      <PrivateRoute>
        <ProjectsPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/projects/archived",
    element: (
      <PrivateRoute>
        <ArchivedProjectsPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/projects/new",
    element: (
      <PrivateRoute>
        <CreateProjectPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/projects/:projectId",
    element: (
      <PrivateRoute>
        <ProjectDetailPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/expenses",
    element: (
      <PrivateRoute>
        <Expenses />
      </PrivateRoute>
    ),
  },
  {
    path: "/earnings",
    element: (
      <PrivateRoute>
        <Earnings />
      </PrivateRoute>
    ),
  },
  {
    path: "/import-data",
    element: (
      <PrivateRoute>
        <ImportDataPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <PrivateRoute>
        <SettingsPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/account",
    element: (
      <PrivateRoute>
        <AccountPage />
      </PrivateRoute>
    ),
  },
]);