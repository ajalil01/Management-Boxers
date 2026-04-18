import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  UserCircle,
  ChevronDown,
  // Dumbbell,
  Calendar,
  // Trophy,
  FileText,
} from "lucide-react";
import logo from "../../assets/logo.png";
import "./Sidebar.scss";

import { getCurrentUser } from "../../api/user";
import {
  extractNameFromEmail,
  getInitialFromEmail,
} from "../../utils/userFormatter";

interface SidebarProps {
  role: "coach" | "admin";
}

const menuItems = {
  coach: [
    {
      label: "sidebar.dashboard",
      path: "/coach/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "sidebar.schedule",
      path: "/coach/dashboard/schedule",
      icon: Calendar,
    },
    {
      label: "sidebar.athletes",
      path: "/coach/dashboard/athletes",
      icon: Users,
    },
  ],
  admin: [
    { label: "sidebar.Home", path: "/admin/dashboard/home", icon: LayoutDashboard },
    { label: "sidebar.Coaches", path: "/admin/dashboard/coaches", icon: Users },
    { label: "sidebar.Admins", path: "/admin/dashboard/admins", icon: FileText },
  ],
};

export default function Sidebar({ role }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [userName, setUserName] = useState("Loading...");
  const [userEmail, setUserEmail] = useState("");
  const [userInitial, setUserInitial] = useState("?");

  const isRTL = i18n.language === "ar";

  // ✅ Memoized fetch
  const fetchUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();

      if (user) {
        setUserEmail(user.email);
        setUserName(extractNameFromEmail(user.email));
        setUserInitial(getInitialFromEmail(user.email));
      }
    } catch (err) {
      console.error("Sidebar fetch user failed:", err);
    }
  }, []);

  // ✅ Initial fetch (no warning)
  useEffect(() => {
    const loadUser = async () => {
      await fetchUser();
    };
    loadUser();
  }, [fetchUser]);

  // ✅ Listen for updates
  useEffect(() => {
    const handleUserUpdate = () => {
      fetchUser();
    };

    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, [fetchUser]);

  // Close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector(".profile-dropdown");
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleProfile = () => {
    navigate(`/${role}/dashboard/profile`);
    setIsProfileOpen(false);
  };

  return (
    <div className={`sidebar ${isRTL ? "rtl" : "ltr"}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <img src={logo} alt="Zephyr" className="logo-img" />
        <span className="logo-text">Zephyr</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems[role].map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${role}/dashboard`}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={20} />
              <span>{t(item.label)}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <NavLink
          to={`/${role}/dashboard/settings`}
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <Settings size={20} />
          <span>{t("sidebar.settings")}</span>
        </NavLink>

        {/* Profile */}
        <div className="profile-dropdown-container">
          <button
            className="profile-trigger"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="profile-avatar">
              <div className="avatar-letter">{userInitial}</div>
            </div>

            <div className="profile-info">
              <span className="profile-name">{userName}</span>
              <span className="profile-email">{userEmail}</span>
            </div>

            <ChevronDown
              size={16}
              className={`dropdown-arrow ${isProfileOpen ? "rotated" : ""}`}
            />
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown">
              <button onClick={handleProfile} className="dropdown-item">
                <UserCircle size={18} />
                <span>{t("sidebar.profile")}</span>
              </button>

              <button onClick={handleLogout} className="dropdown-item logout">
                <LogOut size={18} />
                <span>{t("sidebar.logout")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

