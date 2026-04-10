import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Loader2 } from "lucide-react";
import Alert from "@mui/material/Alert";
import "./CoachesAdminDashboard.css";
import { API_BASE_URL } from "../../../api/config";

interface Admin {
  id: string;
  email: string;
}

interface AdminAPI {
  id: string;
  email: string;
}

export default function AdminUsers() {
  const { t } = useTranslation();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  const [deleteModal, setDeleteModal] = useState<Admin | null>(null);
  const [deleteInput, setDeleteInput] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  // FETCH ADMINS
  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admins`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        setAlert({
          type: "error",
          message: getErrorMessage(json, t("admins.errors.fetch_failed", "Failed to fetch admins")),
        });
        return;
      }

      const mapped: Admin[] = json.data.map((a: AdminAPI) => ({
        id: a.id,
        email: a.email,
      }));

      setAdmins(mapped);
    } catch (err) {
      setAlert({
        type: "error",
        message: t("auth.errors.network", "Network error. Please check your connection."),
      });
      console.error("Failed to fetch admins", err);
    }
  };

  useEffect(() => {
    fetchAdmins();
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

  const handleCreateAdmin = async () => {
    if (!email.trim() || (!isEdit && !password.trim())) {
      setAlert({
        type: "error",
        message: t("admins.errors.required_fields", "Email and password are required"),
      });
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          type: "error",
          message: getErrorMessage(data, t("admins.errors.create_failed", "Failed to create admin")),
        });
        return;
      }

      setAlert({
        type: "success",
        message: t("admins.success.create_success", "Admin created successfully"),
      });

      setIsModalOpen(false);
      resetForm();
      await fetchAdmins();
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

  const handleEditAdmin = async () => {
    if (!selectedAdmin) return;

    if (!email.trim()) {
      setAlert({
        type: "error",
        message: t("admins.errors.email_required", "Email is required"),
      });
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admins/${selectedAdmin.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          type: "error",
          message: getErrorMessage(data, t("admins.errors.update_failed", "Failed to update admin")),
        });
        return;
      }

      setAlert({
        type: "success",
        message: t("admins.success.update_success", "Admin updated successfully"),
      });

      setIsModalOpen(false);
      setSelectedAdmin(null);
      setIsEdit(false);
      resetForm();
      await fetchAdmins();
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

  const handleDeleteAdmin = async (admin: Admin) => {
    if (deleteInput !== admin.email) {
      setAlert({
        type: "error",
        message: t("admins.errors.email_mismatch", "Email confirmation does not match"),
      });
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admins/${admin.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          type: "error",
          message: getErrorMessage(data, t("admins.errors.delete_failed", "Failed to delete admin")),
        });
        return;
      }

      setAlert({
        type: "success",
        message: t("admins.success.delete_success", "Admin deleted successfully"),
      });

      setDeleteModal(null);
      setDeleteInput("");
      await fetchAdmins();
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
    setEmail("");
    setPassword("");
  };

  const openCreateModal = () => {
    setIsEdit(false);
    setSelectedAdmin(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (admin: Admin) => {
    setIsEdit(true);
    setSelectedAdmin(admin);
    setEmail(admin.email);
    setIsModalOpen(true);
  };

  const filteredAdmins = admins.filter((a) =>
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1>{t("admins.title", "Admins")}</h1>
        <button className="add-coach-btn" onClick={openCreateModal}>
          {t("admins.add", "+ Add admin")}
        </button>
      </div>

      <div className="header-divider" />

      {/* SEARCH */}
      <div className="search-section">
        <div className="search-wrapper">
          <Search className="search-icon" size={16} />
          <input
            className="search-input"
            placeholder={t("admins.search", "Search")}
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
              <th>{t("admins.email", "Email")}</th>
              <th>{t("admins.options", "Options")}</th>
            </tr>
          </thead>

          <tbody>
            {filteredAdmins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.email}</td>

                <td className="options-cell">
                  <button
                    className="options-button"
                    onClick={() =>
                      setOpenMenuId(openMenuId === admin.id ? null : admin.id)
                    }
                  >
                    ⋮
                  </button>

                  {openMenuId === admin.id && (
                    <div className="options-menu" ref={menuRef}>
                      <button onClick={() => openEditModal(admin)}>
                        {t("admins.edit", "Edit")}
                      </button>
                      <button onClick={() => setDeleteModal(admin)}>
                        {t("admins.delete", "Delete")}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL (Create/Edit) */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isCreating && !isUpdating && setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEdit ? t("admins.update", "Edit Admin") : t("admins.create", "New Admin")}</h2>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <input
              placeholder={t("admins.email", "Email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {!isEdit && (
              <input
                placeholder={t("admins.password", "Password")}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}

            <div className="modal-actions">
              <button className="cancel" onClick={() => setIsModalOpen(false)}>
                {t("admins.cancel", "Cancel")}
              </button>

              <button
                className="save"
                onClick={isEdit ? handleEditAdmin : handleCreateAdmin}
              >
                {(isCreating || isUpdating) && <Loader2 className="spinner" size={16} />}
                {isCreating ? "Creating..." : isUpdating ? "Updating..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => !isDeleting && setDeleteModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: 'white' }}>Confirm Delete</h2>

            <p style={{ color: 'white' }}>
              Type email to confirm: <b>{deleteModal.email}</b>
            </p>

            <input
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
            />

            <div className="modal-actions">
              <button className="cancel" onClick={() => setDeleteModal(null)}>
                Cancel
              </button>

              <button
                className="save"
                onClick={() => handleDeleteAdmin(deleteModal)}
                disabled={deleteInput !== deleteModal.email}
              >
                {isDeleting && <Loader2 className="spinner" size={16} />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

