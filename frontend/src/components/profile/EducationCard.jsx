/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
import React, { useState, useRef } from "react";
import { MdOutlineEdit, MdCheck, MdClear, MdAdd } from "react-icons/md";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";

const EducationCard = ({ educationData, onDataChange, onEditStart, onEditEnd }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localFormData, setLocalFormData] = useState([]);
  const [dropdownData, setDropdownData] = useState({
    degrees: [],
    institutes: [],
  });
  const containerRef = useRef(null);

  const fetchDropdowns = async () => {
    const [degRes, instRes] = await Promise.all([
      axios.get("http://localhost:7000/api/location/degrees"),
      axios.get("http://localhost:7000/api/location/institutes"),
    ]);
    setDropdownData({ degrees: degRes.data, institutes: instRes.data });
  };

  const handleEditClick = async () => {
    await fetchDropdowns();
    setLocalFormData(JSON.parse(JSON.stringify(educationData)));
    setIsEditing(true);
    if (onEditStart) onEditStart();
  };

  const handleAddEducation = () => {
    setLocalFormData((prev) => [
      ...prev,
      {
        graduation_date: "",
        degree_id: "",
        institute_id: "",
        name: "",
        institute_name: "",
        institute_location: "",
      },
    ]);
    setTimeout(
      () =>
        containerRef.current?.lastElementChild?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        }),
      100
    );
  };

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const list = e.target.list;
    const updated = [...localFormData];
    const edu = { ...updated[index], [name]: value };

    if (list) {
      const option = Array.from(list.options).find(
        (opt) => opt.value === value
      );
      const idField = name === "name" ? "degree_id" : "institute_id";
      edu[idField] = option ? option.dataset.id : "";
    }
    updated[index] = edu;
    setLocalFormData(updated);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const processedData = await Promise.all(
        localFormData.map(async (edu) => {
          let { degree_id, institute_id } = edu;
          if (!degree_id && edu.name) {
            try {
              const res = await axios.post(
                "http://localhost:7000/api/location/newdegrees",
                { name: edu.name }
              );
              degree_id = res.data.degreeId;
            } catch {}
          }
          if (!institute_id && edu.institute_name) {
            try {
              const res = await axios.post(
                "http://localhost:7000/api/location/newinstitutes",
                { name: edu.institute_name }
              );
              institute_id = res.data.instituteId;
            } catch {}
          }
          return { ...edu, degree_id, institute_id };
        })
      );

      for (const edu of processedData) {
        const { institute_location, ...rest } = edu;
        const payload = { ...rest, location: institute_location, token };
        const config = { headers: { Authorization: `Bearer ${token}` } };

        if (edu.id)
          await axios.put(
            "http://localhost:7000/api/profile/updateeducation",
            payload,
            config
          );
        else
          await axios.post(
            "http://localhost:7000/api/profile/neweducation",
            { ...payload, institute_id: edu.institute_id },
            config
          );
      }

      toast.success("Education updated!");
      setIsEditing(false);
      if (onEditEnd) onEditEnd();
      if (onDataChange) onDataChange();
    } catch (e) {
      toast.error("Update failed");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (onEditEnd) onEditEnd();
  };

  return (
    <div
      className={`grid-card education-card ${isEditing ? "is-editing" : ""}`}
    >
      <h3>Education</h3>
      {isEditing ? (
        <>
          <div ref={containerRef}>
            {localFormData.map((edu, index) => (
              <div key={index} className="education-form-group">
                <div className="form-rows">
                  <div className="form-group">
                    <label>Degree</label>
                    <input
                      type="text"
                      name="name"
                      value={edu.name || ""}
                      onChange={(e) => handleInputChange(index, e)}
                      list={`deg-${index}`}
                      className="form-control"
                    />
                    <datalist id={`deg-${index}`}>
                      {dropdownData.degrees.map((d) => (
                        <option key={d.id} data-id={d.id} value={d.name} />
                      ))}
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label>Institute</label>
                    <input
                      type="text"
                      name="institute_name"
                      value={edu.institute_name || ""}
                      onChange={(e) => handleInputChange(index, e)}
                      list={`inst-${index}`}
                      className="form-control"
                    />
                    <datalist id={`inst-${index}`}>
                      {dropdownData.institutes.map((i) => (
                        <option key={i.id} data-id={i.id} value={i.name} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div className="form-rows">
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="institute_location"
                      value={edu.institute_location || ""}
                      onChange={(e) => handleInputChange(index, e)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Graduation</label>
                    <input
                      type="date"
                      name="graduation_date"
                      value={
                        edu.graduation_date
                          ? dayjs(edu.graduation_date).format("YYYY-MM-DD")
                          : ""
                      }
                      onChange={(e) => handleInputChange(index, e)}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="header-actions">
            <div className="edit-controls">
              <button onClick={handleAddEducation} className="add-btn">
                <MdAdd />
              </button>
              <button onClick={handleSave} className="save-btn">
                <MdCheck />
              </button>
              <button onClick={handleCancel} className="cancel-btn">
                <MdClear />
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {educationData.length > 0 ? (
            educationData.map((edu) => (
              <div key={edu.id} className="work-experience-item">
                <div className="experience-header">
                  <h4>{edu.name}</h4>
                  <span className="experience-dates">
                    {dayjs(edu.graduation_date).format("MMM YYYY")}
                  </span>
                </div>
                <p className="company-name">
                  {edu.institute_name} - {edu.institute_location}
                </p>
              </div>
            ))
          ) : (
            <p>No education data available.</p>
          )}
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

export default EducationCard;
