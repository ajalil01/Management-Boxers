import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import { useTranslation } from "react-i18next";

import logo from "../../../../assets/logo.png";
import "../../../../styles/global.scss";
import "../../../../styles/typography.scss";
import "./index.css";

import { API_BASE_URL } from "../../../../api/config";

export default function CoachLoginPage() {
  const bgRef = useRef<HTMLDivElement | null>(null);
  const { t, i18n } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);

  const navigate = useNavigate();

  // RTL support
  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  // Mouse background effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!bgRef.current) return;
      bgRef.current.style.setProperty("--x", `${e.clientX}px`);
      bgRef.current.style.setProperty("--y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Auto hide alert
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  const getErrorMessage = (data: any, fallback: string) => {
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail)) return data.detail[0]?.msg || fallback;
    if (typeof data?.message === "string") return data.message;
    return fallback;
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setAlert({
        type: "error",
        message: t("auth.errors.required_fields"),
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/coach/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          type: "error",
          message: getErrorMessage(data, t("auth.errors.login_failed")),
        });
        return;
      }

      localStorage.setItem("token", data.data.access_token);

      setAlert({
        type: "success",
        message: t("auth.success.login_success"),
      });

      setTimeout(() => {
        navigate("/coach/dashboard");
      }, 500);
    } catch {
      setAlert({
        type: "error",
        message: t("auth.errors.network"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  const isRTL = i18n.language === "ar";

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center overflow-hidden animate-fadeIn ${
        isRTL ? "rtl" : ""
      }`}
      style={{
        backgroundColor: "var(--color-black)",
        color: "var(--color-white)",
      }}
    >
      {alert && (
        <div
          className={`fixed top-5 z-50 w-[300px] ${
            isRTL ? "left-5" : "right-5"
          }`}
        >
          <Alert severity={alert.type}>{alert.message}</Alert>
        </div>
      )}

      {/* Background effect */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            maskImage:
              "radial-gradient(circle at var(--x) var(--y), white 150px, transparent 300px)",
            WebkitMaskImage:
              "radial-gradient(circle at var(--x) var(--y), white 150px, transparent 300px)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <img
            src={logo}
            className="mx-auto w-10 h-10 mb-2 opacity-90 logo-animate"
            alt="Logo"
          />
          <div className="text-brand mb-12 logo-animate">Zephyr Coach</div>

          <h1 className="text-title mb-2 title-animate">
            {t("auth.welcome")}
          </h1>
          <p className="text-subtitle subtitle-animate">
            Coach Access Portal
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-label block mb-1">
              {t("auth.email")}
            </label>
            <input
              type="email"
              value={email}
              placeholder={t("auth.email_placeholder")}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input-field w-full px-4 py-2 rounded-md bg-transparent border outline-none"
              dir="auto"
            />
          </div>

          <div>
            <label className="text-label block mb-1">
              {t("auth.password")}
            </label>
            <input
              type="password"
              value={password}
              placeholder={t("auth.password_placeholder")}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input-field w-full px-4 py-2 rounded-md bg-transparent border outline-none"
              dir="auto"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="login-btn w-full py-2 rounded-md font-medium"
          >
            {loading ? t("auth.loading") : "Coach Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

