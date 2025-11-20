/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { MdOutlineEdit, MdCheck, MdClear, MdClose } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";

const SkillsCard = ({ onDataChange, onEditStart, onEditEnd }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSkills = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.post(
        "http://localhost:7000/api/profile/getskills",
        {}, // Body empty object
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSkills(res.data);
    } catch (err) {
      console.error("Failed to fetch skills");
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
    if (onEditStart) onEditStart();
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchSkills();
    if (onEditEnd) onEditEnd();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && newSkill.trim() !== "") {
      e.preventDefault();
      if (!skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
      }
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      await axios.put(
        "http://localhost:7000/api/profile/updateskills",
        { skills }, // Sending skills directly in body
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Skills updated!");
      setIsEditing(false);
      if (onDataChange) onDataChange();
      if (onEditEnd) onEditEnd();
    } catch (err) {
      toast.error("Failed to update skills.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`grid-card skills-card ${isEditing ? "is-editing" : ""}`}>
      <div className="skills-header">
        <h3>Skills</h3>
        {/* INPUT FIELD MOVED HERE (Above Skills List) */}
        {isEditing && (
            <div className="skill-input-wrapper">
            <input
                type="text"
                className="skill-input"
                placeholder="Type Skill & Press Enter..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
            />
            </div>
        )}
      </div>

      <div className="skills-container">
        {skills.length > 0 ? (
          skills.map((skill, index) => (
            <span key={index} className="skill-badge">
              {skill}
              {isEditing && (
                <MdClose
                  className="remove-skill-icon"
                  onClick={() => removeSkill(skill)}
                />
              )}
            </span>
          ))
        ) : (
          !isEditing && <p style={{ color: "#777" }}>No skills added yet.</p>
        )}
      </div>

      <div className="header-actions">
        {isEditing ? (
          <div className="edit-controls">
            <button
              onClick={handleSave}
              className="save-btn"
              disabled={loading}
            >
              {loading ? "..." : <MdCheck />}
            </button>
            <button
              onClick={handleCancel}
              className="cancel-btn"
              disabled={loading}
            >
              <MdClear />
            </button>
          </div>
        ) : (
          <button onClick={handleEditClick} className="edit-profile-btn">
            <MdOutlineEdit />
          </button>
        )}
      </div>
    </div>
  );
};

export default SkillsCard;