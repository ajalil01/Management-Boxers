import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Alert from "@mui/material/Alert";
import "./AdminProfile.scss";
import { getCurrentUser } from "../../../api/user";
import { getInitialFromEmail } from "../../../utils/userFormatter";
import { Pencil, Save, X } from "lucide-react";
import { API_BASE_URL } from "../../../api/config";

interface User {
  id: string;
  email: string;
  role: string;
}

interface UpdateSuccessResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
  };
}

interface ValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

interface ValidationErrorResponse {
  detail: ValidationErrorItem[];
}

type UpdateResponse = UpdateSuccessResponse | ValidationErrorResponse;

export default function AdminProfile() {
  const { t } = useTranslation();

  const [user, setUser] = useState<User | null>(null);
  const [initial, setInitial] = useState("?");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedPassword, setEditedPassword] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);

  // Auto-dismiss alert after 4 seconds
  useEffect(() => {
    if (!alert) return;

    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  const getErrorMessage = (data: any, fallback: string) => {
    // FastAPI string error: { detail: "Invalid email or password" }
    if (typeof data?.detail === "string") {
      return data.detail;
    }

    // FastAPI validation error: { detail: [{ msg: "..."}] }
    if (Array.isArray(data?.detail) && data.detail.length > 0) {
      return data.detail[0]?.msg || fallback;
    }

    // Custom backend format: { message: "..." }
    if (typeof data?.message === "string") {
      return data.message;
    }

    return fallback;
  };

  const fetchUser = useCallback(async () => {
    try {
      const res = await getCurrentUser();
      if (res) {
        setUser(res);
        setInitial(getInitialFromEmail(res.email));
        setEditedEmail(res.email);
      }
    } catch (err) {
      setAlert({
        type: "error",
        message: t("profile.errors.fetch_failed", "Failed to load user profile"),
      });
      console.error("Failed to fetch user:", err);
    }
  }, [t]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      const emailChanged = editedEmail !== user.email;
      const passwordChanged = editedPassword.length > 0;
      setHasChanges(emailChanged || passwordChanged);
    }
  }, [editedEmail, editedPassword, user]);

  const handleEmailEdit = () => setIsEditingEmail(true);

  const handleEmailSave = () => setIsEditingEmail(false);

  const handleEmailCancel = () => {
    setEditedEmail(user?.email || "");
    setIsEditingEmail(false);
  };

  const handlePasswordEdit = () => {
    setIsEditingPassword(true);
    setTempPassword("");
  };

  const handlePasswordSave = () => {
    setEditedPassword(tempPassword);
    setIsEditingPassword(false);
  };

  const handlePasswordCancel = () => {
    setTempPassword("");
    setIsEditingPassword(false);
  };

  const handleCancel = () => {
    if (user) {
      setEditedEmail(user.email);
      setEditedPassword("");
      setTempPassword("");
      setIsEditingEmail(false);
      setIsEditingPassword(false);
      setHasChanges(false);
      setAlert(null);
    }
  };

  const isValidationError = (
    data: UpdateResponse
  ): data is ValidationErrorResponse => {
    return "detail" in data;
  };

  const isSuccessResponse = (
    data: UpdateResponse
  ): data is UpdateSuccessResponse => {
    return "success" in data;
  };

  const handleSave = async () => {
    if (!user || !hasChanges) return;

    setIsSaving(true);
    setAlert(null);

    const token = localStorage.getItem("token");

    try {
      const params = new URLSearchParams();

      if (editedEmail !== user.email) {
        params.append("email", editedEmail);
      }

      if (editedPassword.length > 0) {
        params.append("password", editedPassword);
      }

      const url = `${API_BASE_URL}/api/admins/${user.id}?${params.toString()}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: UpdateResponse = await response.json();

      if (!response.ok) {
        let errorMessage: string;
        
        if (isValidationError(data)) {
          errorMessage = data.detail.map((e) => e.msg).join(", ");
        } else {
          errorMessage = getErrorMessage(data, t("profile.errors.update_failed"));
        }
        
        setAlert({
          type: "error",
          message: errorMessage,
        });
        return;
      }

      if (isSuccessResponse(data)) {
        await fetchUser();
        window.dispatchEvent(new Event("userUpdated"));

        setEditedPassword("");
        setTempPassword("");
        setHasChanges(false);
        
        setAlert({
          type: "success",
          message: t("profile.success.update_success", "Profile updated successfully"),
        });
      }
    } catch (err) {
      console.error(err);
      setAlert({
        type: "error",
        message: t("profile.errors.network", "Network error. Please check your connection."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-profile">
      {/* Alert Component */}
      {alert && (
        <div className="fixed top-5 right-5 z-50 w-[300px]">
          <Alert severity={alert.type}>{alert.message}</Alert>
        </div>
      )}

      <div className="profile-card">
        {/* Avatar */}
        <div className="profile-avatar">
          <div className="avatar-letter">{initial}</div>
        </div>

        {/* Account Info */}
        <div className="profile-section">
          <div className="section-header">
            <h3>{t("profile.account_info")}</h3>
            <div className="section-line"></div>
          </div>

          <div className="profile-field">
            <label>{t("profile.email")}</label>
            <div className="field-with-icon">
              {isEditingEmail ? (
                <>
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    autoFocus
                  />
                  <button className="icon-button save-icon" onClick={handleEmailSave}>
                    <Save size={16} />
                  </button>
                  <button className="icon-button cancel-icon" onClick={handleEmailCancel}>
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <input type="text" value={editedEmail} disabled />
                  <button className="icon-button edit-icon" onClick={handleEmailEdit}>
                    <Pencil size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="profile-field">
            <label>{t("profile.role")}</label>
            <input type="text" value={user?.role || ""} disabled />
          </div>
        </div>

        {/* Security */}
        <div className="profile-section">
          <div className="section-header">
            <h3>{t("profile.security")}</h3>
            <div className="section-line"></div>
          </div>

          <div className="profile-field">
            <label>{t("profile.password")}</label>
            <div className="field-with-icon">
              {isEditingPassword ? (
                <>
                  <input
                    type="password"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    placeholder={t("profile.password_placeholder")}
                    autoFocus
                  />
                  <button className="icon-button save-icon" onClick={handlePasswordSave}>
                    <Save size={16} />
                  </button>
                  <button className="icon-button cancel-icon" onClick={handlePasswordCancel}>
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="password"
                    value={editedPassword || "************"}
                    disabled
                  />
                  <button className="icon-button edit-icon" onClick={handlePasswordEdit}>
                    <Pencil size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="profile-actions">
          <button
            className={`btn-cancel ${!hasChanges ? "disabled" : ""}`}
            onClick={handleCancel}
            disabled={!hasChanges || isSaving}
          >
            {t("profile.cancel")}
          </button>

          <button
            className={`btn-save ${!hasChanges ? "inactive" : ""}`}
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? t("profile.saving") : t("profile.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

