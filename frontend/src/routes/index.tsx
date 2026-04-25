import { createBrowserRouter } from "react-router-dom";
import NotFound from "../pages/public/notfound/index";
import LandingPage from "../pages/public/landingPage";
import Login from "../pages/public/auth/login/Login";
import CoachLoginPage from "../pages/public/auth/login/CoachLogin";
import DashboardLayout from "../layouts/DashboardLayout";

// Coach pages
import CoachHome from "../pages/coach/home";
// import CoachPlayers from "../pages/coach/players";
import CoachSettings from "../pages/coach/settings";
import CoachSchedule from "../pages/coach/schedule";
import CoachAthletes from "../pages/coach/athletes";
import CoachProfile from "../pages/coach/profile";
import RPEDashboard from "../pages/coach/rpe";

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
    element: <CoachLoginPage />,
  },
  {
    path: "/admin/login",
    element: <Login />,
  },

  // COACH DASHBOARD
  {
    path: "/coach/dashboard",
    element: <DashboardLayout role="coach" />,
    children: [
      { index: true, element: <CoachHome /> },
      { path: "schedule", element: <CoachSchedule /> },
      { path: "athletes", element: <CoachAthletes /> },
      { path: "settings", element: <CoachSettings /> },
      { path: "profile", element: <CoachProfile /> },
      { path: "rpe", element: <RPEDashboard /> },

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

