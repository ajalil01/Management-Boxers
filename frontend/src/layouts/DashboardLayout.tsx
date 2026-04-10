import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/sidebar/Sidebar";
import "./DashboardLayout.scss";

export default function DashboardLayout({ role }: { role: "coach" | "admin" }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />
      <div className={`main-content ${isRTL ? 'rtl' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
}

