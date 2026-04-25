import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Loader2, ImageIcon } from "lucide-react";
import Alert from "@mui/material/Alert";
import "./CoachesAdminDashboard.css";
import { API_BASE_URL, IMAGE_URL } from "../../../api/config";

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture: string | null;
  coachId: string;
}

interface AthleteAPI {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  picture: string | null;
  coach_id: string;
}

export default function CoachAthletes() {
  const { t } = useTranslation();

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

  const [deleteModal, setDeleteModal] = useState<Athlete | null>(null);
  const [deleteInput, setDeleteInput] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const token = localStorage.getItem("token");

  // Auto-dismiss alert after 4 seconds
  useEffect(() => {
    if (!alert) return;

    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  const getErrorMessage = (data: any, fallback: string) => {
    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data?.detail) && data.detail.length > 0) {
      return data.detail[0]?.msg || fallback;
    }

    if (typeof data?.message === "string") {
      return data.message;
    }

    return fallback;
  };

  // Helper to get full image URL
  const getFullImageUrl = (picturePath: string | null): string | null => {
    if (!picturePath) return null;
    return `${IMAGE_URL}/${picturePath}`;
  };

  // FETCH ATHLETES
  const fetchAthletes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/boxers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        setAlert({
          type: "error",
          message: getErrorMessage(json, t("athletes.errors.fetch_failed", "Failed to fetch athletes")),
        });
        return;
      }

      const mapped: Athlete[] = json.data.map((a: AthleteAPI) => ({
        id: a.id,
        firstName: a.first_name,
        lastName: a.last_name,
        email: a.email,
        picture: getFullImageUrl(a.picture),
        coachId: a.coach_id,
      }));

      setAthletes(mapped);
    } catch (err) {
      setAlert({
        type: "error",
        message: t("auth.errors.network", "Network error. Please check your connection."),
      });
      console.error("Failed to fetch athletes", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
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

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAthlete = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setAlert({
        type: "error",
        message: t("athletes.errors.required_fields", "All fields are required"),
      });
      return;
    }

    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("email", email);
      formData.append("password", password);
      if (picture) {
        formData.append("picture", picture);
      }

      const res = await fetch(`${API_BASE_URL}/api/boxers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          type: "error",
          message: getErrorMessage(data, t("athletes.errors.create_failed", "Failed to create athlete")),
        });
        return;
      }

      setAlert({
        type: "success",
        message: t("athletes.success.create_success", "Athlete created successfully"),
      });

      setIsModalOpen(false);
      resetForm();
      await fetchAthletes();
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

  const handleEditAthlete = async () => {
    if (!selectedAthlete) return;
    
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setAlert({
        type: "error",
        message: t("athletes.errors.required_fields_edit", "First name, last name and email are required"),
      });
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("email", email);
      if (password) {
        formData.append("password", password);
      }
      if (picture) {
        formData.append("picture", picture);
      }

      const res = await fetch(`${API_BASE_URL}/api/boxers/${selectedAthlete.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          type: "error",
          message: getErrorMessage(data, t("athletes.errors.update_failed", "Failed to update athlete")),
        });
        return;
      }

      setAlert({
        type: "success",
        message: t("athletes.success.update_success", "Athlete updated successfully"),
      });

      setIsModalOpen(false);
      setSelectedAthlete(null);
      setIsEdit(false);
      resetForm();
      await fetchAthletes();
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

  const handleDeleteAthlete = async (athlete: Athlete) => {
    if (deleteInput !== athlete.email) {
      setAlert({
        type: "error",
        message: t("athletes.errors.email_mismatch", "Email confirmation does not match"),
      });
      return;
    }
    
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/boxers/${athlete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          type: "error",
          message: getErrorMessage(data, t("athletes.errors.delete_failed", "Failed to delete athlete")),
        });
        return;
      }

      setAlert({
        type: "success",
        message: t("athletes.success.delete_success", "Athlete deleted successfully"),
      });

      setDeleteModal(null);
      setDeleteInput("");
      await fetchAthletes();
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
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setPicture(null);
    setPicturePreview(null);
  };

  const openCreateModal = () => {
    setIsEdit(false);
    setSelectedAthlete(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (athlete: Athlete) => {
    setIsEdit(true);
    setSelectedAthlete(athlete);
    setFirstName(athlete.firstName);
    setLastName(athlete.lastName);
    setEmail(athlete.email);
    setPassword("");
    setPicture(null);
    setPicturePreview(athlete.picture);
    setIsModalOpen(true);
  };

  const filteredAthletes = athletes.filter((a) =>
    `${a.firstName} ${a.lastName} ${a.email}`
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
        <h1>{t("athletes.title", "Athletes")}</h1>
        <button className="add-coach-btn" onClick={openCreateModal}>
          {t("athletes.add", "+ Add athlete")}
        </button>
      </div>

      <div className="header-divider" />

      {/* SEARCH */}
      <div className="search-section">
        <div className="search-wrapper">
          <Search className="search-icon" size={16} />
          <input
            className="search-input"
            placeholder={t("athletes.search", "Search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="table-container">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="spinner text-white" size={32} />
          </div>
        ) : (
          <table className="coaches-table">
            <thead>
              <tr>
                <th>{t("athletes.picture", "Picture")}</th>
                <th>{t("athletes.first", "First")}</th>
                <th>{t("athletes.last", "Last")}</th>
                <th>{t("athletes.email", "Email")}</th>
                <th>{t("athletes.options", "Options")}</th>
              </tr>
            </thead>

            <tbody>
              {filteredAthletes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="no-results">
                    {t("athletes.no_results", "No athletes found")}
                  </td>
                </tr>
              ) : (
                filteredAthletes.map((athlete) => (
                  <tr key={athlete.id}>
                    <td>
                      {athlete.picture ? (
                        <img
                          src={athlete.picture}
                          alt={`${athlete.firstName} ${athlete.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          <span className="text-white text-sm">
                            {athlete.firstName[0]}{athlete.lastName[0]}
                          </span>
                        </div>
                      )}
                    </td>
                    <td>{athlete.firstName}</td>
                    <td>{athlete.lastName}</td>
                    <td>{athlete.email}</td>

                    <td className="options-cell">
                      <button
                        className="options-button"
                        onClick={() =>
                          setOpenMenuId(openMenuId === athlete.id ? null : athlete.id)
                        }
                      >
                        ⋮
                      </button>

                      {openMenuId === athlete.id && (
                        <div className="options-menu" ref={menuRef}>
                          <button onClick={() => openEditModal(athlete)}>
                            {t("athletes.edit", "Edit")}
                          </button>
                          <button onClick={() => setDeleteModal(athlete)}>
                            {t("athletes.delete", "Delete")}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isCreating && !isUpdating && setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEdit ? t("athletes.update", "Edit Athlete") : t("athletes.create", "New Athlete")}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isCreating || isUpdating}
              >
                ✕
              </button>
            </div>

            {/* Picture Upload */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-gray-600"
                onClick={() => fileInputRef.current?.click()}
              >
                {picturePreview ? (
                  <img src={picturePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={32} className="text-gray-400" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="hidden"
                disabled={isCreating || isUpdating}
              />
              <button
                type="button"
                className="text-sm text-gray-400 hover:text-white"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCreating || isUpdating}
              >
                {picturePreview && isEdit && selectedAthlete?.picture === picturePreview
                  ? t("athletes.change_picture", "Change picture")
                  : t("athletes.upload_picture", "Upload picture")}
              </button>
            </div>

            <input
              placeholder={t("athletes.first_name", "First name")}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isCreating || isUpdating}
            />

            <input
              placeholder={t("athletes.last_name", "Last name")}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isCreating || isUpdating}
            />

            <input
              placeholder={t("athletes.email", "Email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isCreating || isUpdating}
            />

            <input
              placeholder={isEdit ? t("athletes.password_optional", "Password (optional)") : t("athletes.password", "Password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isCreating || isUpdating}
            />

            <div className="modal-actions">
              <button 
                className="cancel" 
                onClick={() => setIsModalOpen(false)}
                disabled={isCreating || isUpdating}
              >
                {t("athletes.cancel", "Cancel")}
              </button>

              <button
                className="save"
                onClick={isEdit ? handleEditAthlete : handleCreateAthlete}
                disabled={isCreating || isUpdating}
              >
                {(isCreating || isUpdating) && <Loader2 className="spinner" size={16} />}
                {isCreating ? t("athletes.creating", "Creating...") : isUpdating ? t("athletes.updating", "Updating...") : t("athletes.save", "Save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => !isDeleting && setDeleteModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: 'white' }}>{t("athletes.confirm_delete", "Confirm Delete")}</h2>

            <p style={{ color: 'white' }}>
              {t("athletes.type_to_confirm", "Type email to confirm:")} <b>{deleteModal.email}</b>
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
                {t("athletes.cancel", "Cancel")}
              </button>

              <button
                className="save"
                onClick={() => handleDeleteAthlete(deleteModal)}
                disabled={deleteInput !== deleteModal.email || isDeleting}
              >
                {isDeleting && <Loader2 className="spinner" size={16} />}
                {isDeleting ? t("athletes.deleting", "Deleting...") : t("athletes.confirm", "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

