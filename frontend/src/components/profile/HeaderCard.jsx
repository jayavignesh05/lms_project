import React, { useState } from "react";
import { MdOutlineEdit, MdCheck, MdClear } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import dayjs from "dayjs"; // <--- IMPORTANT: Import dayjs for date formatting

const HeaderCard = ({ profileData, onDataChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState([]);

  const fetchDropdowns = async () => {
    try {
      const res = await axios.get(
        "http://localhost:7000/api/location/currentstatus"
      );
      setStatuses(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditClick = async () => {
    await fetchDropdowns();

    // --- THE FIX IS HERE ---
    // We must pre-fill formData with ALL existing data, not just name/status.
    setFormData({
      // Fields managed by this card
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      current_status_id: profileData.current_status_id,

      // --- HIDDEN FIELDS (Required by Backend to avoid NULL errors) ---
      email_id: profileData.email, // Backend expects 'email_id'
      contact_no: profileData.contact_no,
      gender_id: profileData.gender_id,
      // Format date correctly for MySQL (YYYY-MM-DD) or send null
      date_of_birth: profileData.date_of_birth
        ? dayjs(profileData.date_of_birth).format("YYYY-MM-DD")
        : null,
      addresses: profileData.addresses || [],
    });

    setIsEditing(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:7000/api/profile/update", {
        ...formData,
        token,
      });
      toast.success("Profile updated!");
      setIsEditing(false);
      if (onDataChange) onDataChange();
    } catch (err) {
      console.error("Update Error:", err.response?.data); // Log exact backend error
      toast.error("Failed to update.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={`grid-card header-card ${isEditing ? "is-editing" : ""}`}>
      {isEditing ? (
        <>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name || ""}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name || ""}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Current Status</label>
            <select
              name="current_status_id"
              value={formData.current_status_id || ""}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Select Status</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="header-actions">
            <div className="edit-controls">
              <button onClick={handleSave} className="save-btn">
                <MdCheck />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="cancel-btn"
              >
                <MdClear />
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <h2>
            {profileData.first_name} {profileData.last_name}
          </h2>
          <p>{profileData.current_status_name || "N/A"}</p>
          <div className="header-actions">
            <button onClick={handleEditClick} className="edit-profile-btn">
              <MdOutlineEdit />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HeaderCard;
