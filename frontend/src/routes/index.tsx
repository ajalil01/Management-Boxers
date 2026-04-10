import { createBrowserRouter } from "react-router-dom";
import NotFound from "../pages/notfound/index";
import LandingPage from "../pages/public/landingPage";
import Login from "../pages/public/auth/login/Login";
import DashboardLayout from "../layouts/DashboardLayout";

// Coach pages
import CoachHome from "../pages/coach/home";
import CoachPlayers from "../pages/coach/players";
import CoachSettings from "../pages/coach/settings";

// Admin pages
import AdminHome from "../pages/admin/home";
import AdminUsers from "../pages/admin/users";
import CoachesAdminDashboard from "../pages/admin/coaches";
import AdminSettings from "../pages/admin/settings";
import AdminProfile from "../pages/admin/profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },

  // COACH DASHBOARD
  {
    path: "/coach/dashboard",
    element: <DashboardLayout role="coach" />,
    children: [
      { index: true, element: <CoachHome /> },
      { path: "players", element: <CoachPlayers /> },
      { path: "training", element: <div>Training Page</div> },
      { path: "matches", element: <div>Matches Page</div> },
      { path: "analytics", element: <div>Analytics Page</div> },
      { path: "settings", element: <CoachSettings /> }, // Add this
    ],
  },

  // ADMIN DASHBOARD
  {
    path: "/admin/dashboard",
    element: <DashboardLayout role="admin" />,
    children: [
      { index: true, element: <AdminHome /> },
      { path: "home", element: <AdminHome /> },
      { path: "admins", element: <AdminUsers /> },
      { path: "coaches", element: <CoachesAdminDashboard /> },
      { path: "settings", element: <AdminSettings /> }, // Add this
      { path: "profile", element: <AdminProfile /> }, // Add this
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);

