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
  
  // Ensure this API URL is correct
  const base_api = "https://student-leaning.onrender.com/api";

  const fetchSkills = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.post(`${base_api}/profile/getskills`, { token });
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
    fetchSkills(); // Revert back to original
    setNewSkill(""); 
    if (onEditEnd) onEditEnd();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && newSkill.trim() !== "") {
      e.preventDefault();
      const skillToAdd = newSkill.trim();
      
      if (!skills.includes(skillToAdd)) {
        setSkills((prev) => [...prev, skillToAdd]);
      }
      setNewSkill(""); 
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  // --- UPDATED SAVE FUNCTION ---
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    
    try {
      // 1. Create a copy of current skills
      let finalSkills = [...skills];

      // 2. Check if there is text in the input box that hasn't been added yet
      if (newSkill.trim() !== "") {
        const pendingSkill = newSkill.trim();
        // Avoid duplicates
        if (!finalSkills.includes(pendingSkill)) {
          finalSkills.push(pendingSkill);
        }
      }

      // 3. Send the FINAL list (Existing + Pending Input)
      await axios.put(`${base_api}/profile/updateskills`, { skills: finalSkills, token });
      
      toast.success("Skills updated!");
      
      // 4. Update UI state immediately
      setSkills(finalSkills);
      setNewSkill(""); // Clear the input box
      setIsEditing(false);
      
      // 5. Background Refresh
      fetchSkills(); 
      
      if (onDataChange) onDataChange();
      if (onEditEnd) onEditEnd();
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to update skills.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`grid-card skills-card ${isEditing ? "is-editing" : ""}`}>
      <div className="skills-header">
        <h3>Skills</h3>
        
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
        {skills && skills.length > 0 ? (
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