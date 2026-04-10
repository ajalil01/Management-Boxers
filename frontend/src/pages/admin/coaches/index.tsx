import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Loader2 } from "lucide-react";
import Alert from "@mui/material/Alert";
import "./CoachesAdminDashboard.css";
import { API_BASE_URL } from "../../../api/config";

interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  athletesCount: number;
}

interface CoachAPI {
  id: string;
  full_name: string;
  email: string;
}

export default function CoachesAdminDashboard() {
  const { t } = useTranslation();

  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  const [deleteModal, setDeleteModal] = useState<Coach | null>(null);
  const [deleteInput, setDeleteInput] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const token = localStorage.getItem("token");

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

  // FETCH COACHES
  const fetchCoaches = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/coaches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        setAlert({
          type: "error",
          message: getErrorMessage(json, t("coaches.errors.fetch_failed", "Failed to fetch coaches")),
        });
        return;
      }

      const mapped: Coach[] = json.data.map((c: CoachAPI) => {
        const [firstName, ...rest] = c.full_name.split(" ");
        return {
          id: c.id,
          firstName,
          lastName: rest.join(" "),
          email: c.email,
          phoneNumber: "—",
          athletesCount: 0,
        };
      });

      setCoaches(mapped);
    } catch (err) {
      setAlert({
        type: "error",
        message: t("auth.errors.network", "Network error. Please check your connection."),
      });
      console.error("Failed to fetch coaches", err);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  // CLOSE MENU OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateCoach = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setAlert({
        type: "error",
        message: t("coaches.errors.required_fields", "All fields are required"),
      });
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/coaches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          type: "error",
          message: getErrorMessage(data, t("coaches.errors.create_failed", "Failed to create coach")),
        });
        return;
      }

      setAlert({
        type: "success",
        message: t("coaches.success.create_success", "Coach created successfully"),
      });

      setIsModalOpen(false);
      resetForm();
      await fetchCoaches();
    } catch (err) {
      setAlert({
        type: "error",
        message: t("auth.errors.network", "Network error. Please check your connection."),
      });
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditCoach = async () => {
    if (!selectedCoach) return;
    
    if (!fullName.trim() || !email.trim()) {
      setAlert({
        type: "error",
        message: t("coaches.errors.required_fields_edit", "Full name and email are required"),
      });
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/coaches/${selectedCoach.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          type: "error",
          message: getErrorMessage(data, t("coaches.errors.update_failed", "Failed to update coach")),
        });
        return;
      }

      setAlert({
        type: "success",
        message: t("coaches.success.update_success", "Coach updated successfully"),
      });

      setIsModalOpen(false);
      setSelectedCoach(null);
      setIsEdit(false);
      resetForm();
      await fetchCoaches();
    } catch (err) {
      setAlert({
        type: "error",
        message: t("auth.errors.network", "Network error. Please check your connection."),
      });
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCoach = async (coach: Coach) => {
    if (deleteInput !== coach.email) {
      setAlert({
        type: "error",
        message: t("coaches.errors.email_mismatch", "Email confirmation does not match"),
      });
      return;
    }
    
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/coaches/${coach.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          type: "error",
          message: getErrorMessage(data, t("coaches.errors.delete_failed", "Failed to delete coach")),
        });
        return;
      }

      setAlert({
        type: "success",
        message: t("coaches.success.delete_success", "Coach deleted successfully"),
      });

      setDeleteModal(null);
      setDeleteInput("");
      await fetchCoaches();
    } catch (err) {
      setAlert({
        type: "error",
        message: t("auth.errors.network", "Network error. Please check your connection."),
      });
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
  };

  const openCreateModal = () => {
    setIsEdit(false);
    setSelectedCoach(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (coach: Coach) => {
    setIsEdit(true);
    setSelectedCoach(coach);
    setFullName(`${coach.firstName} ${coach.lastName}`);
    setEmail(coach.email);
    setIsModalOpen(true);
  };

  const filteredCoaches = coaches.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="coaches-dashboard">
      {/* Alert Component */}
      {alert && (
        <div className="fixed top-5 right-5 z-50 w-[300px]">
          <Alert severity={alert.type}>{alert.message}</Alert>
        </div>
      )}

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>{t("coaches.title", "Coaches")}</h1>
        <button className="add-coach-btn" onClick={openCreateModal}>
          {t("coaches.add", "+ Add coach")}
        </button>
      </div>

      <div className="header-divider" />

      {/* SEARCH */}
      <div className="search-section">
        <div className="search-wrapper">
          <Search className="search-icon" size={16} />
          <input
            className="search-input"
            placeholder={t("coaches.search", "Search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table className="coaches-table">
          <thead>
            <tr>
              <th>{t("coaches.first", "First")}</th>
              <th>{t("coaches.last", "Last")}</th>
              <th>{t("coaches.email", "Email")}</th>
              <th>{t("coaches.phone", "Phone")}</th>
              <th>{t("coaches.athletes", "Athletes")}</th>
              <th>{t("coaches.options", "Options")}</th>
            </tr>
          </thead>

          <tbody>
            {filteredCoaches.map((coach) => (
              <tr key={coach.id}>
                <td>{coach.firstName}</td>
                <td>{coach.lastName}</td>
                <td>{coach.email}</td>
                <td>{coach.phoneNumber}</td>
                <td>{coach.athletesCount}</td>

                <td className="options-cell">
                  <button
                    className="options-button"
                    onClick={() =>
                      setOpenMenuId(openMenuId === coach.id ? null : coach.id)
                    }
                  >
                    ⋮
                  </button>

                  {openMenuId === coach.id && (
                    <div className="options-menu" ref={menuRef}>
                      <button onClick={() => openEditModal(coach)}>
                        {t("coaches.edit", "Edit")}
                      </button>
                      <button onClick={() => setDeleteModal(coach)}>
                        {t("coaches.delete", "Delete")}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isCreating && !isUpdating && setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEdit ? t("coaches.update", "Edit Coach") : t("coaches.create", "New Coach")}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isCreating || isUpdating}
              >
                ✕
              </button>
            </div>

            <input
              placeholder={t("coaches.full_name", "Full name")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isCreating || isUpdating}
            />

            <input
              placeholder={t("coaches.email", "Email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isCreating || isUpdating}
            />

            {!isEdit && (
              <input
                placeholder={t("coaches.password", "Password")}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isCreating || isUpdating}
              />
            )}

            <div className="modal-actions">
              <button 
                className="cancel" 
                onClick={() => setIsModalOpen(false)}
                disabled={isCreating || isUpdating}
              >
                {t("coaches.cancel", "Cancel")}
              </button>

              <button
                className="save"
                onClick={isEdit ? handleEditCoach : handleCreateCoach}
                disabled={isCreating || isUpdating}
              >
                {(isCreating || isUpdating) && <Loader2 className="spinner" size={16} />}
                {isCreating ? t("coaches.creating", "Creating...") : isUpdating ? t("coaches.updating", "Updating...") : t("coaches.save", "Save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => !isDeleting && setDeleteModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: 'white' }}>{t("coaches.confirm_delete", "Confirm Delete")}</h2>

            <p style={{ color: 'white' }}>
              {t("coaches.type_to_confirm", "Type email to confirm:")} <b>{deleteModal.email}</b>
            </p>

            <input
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              disabled={isDeleting}
            />

            <div className="modal-actions">
              <button
                className="cancel"
                onClick={() => setDeleteModal(null)}
                disabled={isDeleting}
              >
                {t("coaches.cancel", "Cancel")}
              </button>

              <button
                className="save"
                onClick={() => handleDeleteCoach(deleteModal)}
                disabled={deleteInput !== deleteModal.email || isDeleting}
              >
                {isDeleting && <Loader2 className="spinner" size={16} />}
                {isDeleting ? t("coaches.deleting", "Deleting...") : t("coaches.confirm", "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

