import React, { useState } from "react";
import { MdOutlineEdit, MdCheck, MdClear, MdOutlineMailOutline } from "react-icons/md";
import { FiPhone } from "react-icons/fi";
import { FaLinkedin } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import dayjs from "dayjs"; 

const ContactCard = ({ profileData, onDataChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

 const handleEditClick = () => {
    setFormData({
    
      email_id: profileData.email || "",
      contact_no: profileData.contact_no || "",
      linkedin_url: profileData.linkedin_url || "", 

      
      first_name: profileData.first_name || "",
      last_name: profileData.last_name || "",
      gender_id: profileData.gender_id || "",
      current_status_id: profileData.current_status_id || "",
      
      
      date_of_birth: profileData.date_of_birth 
        ? dayjs(profileData.date_of_birth).format("YYYY-MM-DD") 
        : null,
        
      addresses: profileData.addresses || []
    });
    
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:7000/api/profile/update", {
        ...formData,
        token,
      });
      toast.success("Contact details updated!");
      setIsEditing(false);
      if (onDataChange) onDataChange();
    } catch (err) {
      console.error("Update Error:", err.response?.data);
      toast.error("Failed to update contact.");
    }
  };

  return (
    <div className={`grid-card contact-card ${isEditing ? "is-editing" : ""}`}>
      <h3>Contact</h3>
      {isEditing ? (
        <>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email_id"
              value={formData.email_id || ""}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Contact No</label>
            <input
              type="text"
              name="contact_no"
              value={formData.contact_no || ""}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>LinkedIn URL</label>
            <input
              type="text"
              name="linkedin_url"
              value={formData.linkedin_url || ""}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="header-actions">
             <div className="edit-controls">
                <button onClick={handleSave} className="save-btn"><MdCheck /></button>
                <button onClick={handleCancel} className="cancel-btn"><MdClear /></button>
             </div>
          </div>
        </>
      ) : (
        <>
          <div className="contact-item">
            <MdOutlineMailOutline />
            <span>{profileData.email}</span>
          </div>
          <div className="contact-item">
            <FiPhone />
            <span>{profileData.contact_no}</span>
          </div>
          {profileData.linkedin_url && (
             <div className="contact-item">
               <FaLinkedin style={{ color: "#0077b5" }} />
               <a 
                 href={profileData.linkedin_url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 style={{ textDecoration: "none", color: "inherit", wordBreak: "break-all" }}
               >
                 {profileData.linkedin_url}
               </a>
             </div>
          )}
          <div className="header-actions">
            <button onClick={handleEditClick} className="edit-profile-btn"><MdOutlineEdit /></button>
          </div>
        </>
      )}
    </div>
  );
};

export default ContactCard;