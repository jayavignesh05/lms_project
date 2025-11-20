/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
import React, { useState, useRef } from "react";
import { MdOutlineEdit, MdCheck, MdClear, MdAdd } from "react-icons/md";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";

const ExperienceCard = ({ experienceData, onDataChange, formatDate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localFormData, setLocalFormData] = useState([]);
  const [dropdownData, setDropdownData] = useState({
    companies: [],
    designations: [],
  });
  const containerRef = useRef(null);

  const fetchDropdowns = async () => {
    const [compRes, desRes] = await Promise.all([
      axios.get("http://localhost:7000/api/location/companies"),
      axios.get("http://localhost:7000/api/location/designations"),
    ]);
    setDropdownData({ companies: compRes.data, designations: desRes.data });
  };

  const handleEditClick = async () => {
    await fetchDropdowns();
    setLocalFormData(JSON.parse(JSON.stringify(experienceData)));
    setIsEditing(true);
  };

  const handleAddExperience = () => {
    setLocalFormData((prev) => [
      ...prev,
      {
        joining_date: "",
        relieving_date: null,
        company_name: "",
        designation_name: "",
        company_location: "",
        company_id: "",
        designation_id: "",
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
    const exp = { ...updated[index], [name]: value };

    if (list) {
      const option = Array.from(list.options).find(
        (opt) => opt.value === value
      );
      const idField =
        name === "designation_name" ? "designation_id" : "company_id";
      exp[idField] = option ? option.dataset.id : "";
    }
    updated[index] = exp;
    setLocalFormData(updated);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      // Create New Company/Designation if needed (Optional logic if backend requires IDs)
      const preparedData = await Promise.all(
        localFormData.map(async (exp) => {
          let { company_id, designation_id } = exp;
          if (!company_id && exp.company_name) {
            try {
              const res = await axios.post(
                "http://localhost:7000/api/location/newcompanies",
                { name: exp.company_name }
              );
              company_id = res.data.companyId;
            } catch {}
          }
          if (!designation_id && exp.designation_name) {
            try {
              const res = await axios.post(
                "http://localhost:7000/api/location/newdesignations",
                { name: exp.designation_name }
              );
              designation_id = res.data.designationId;
            } catch {}
          }
          return { ...exp, company_id, designation_id };
        })
      );

      for (const exp of preparedData) {
        const url = exp.id
          ? "http://localhost:7000/api/profile/updateexperience"
          : "http://localhost:7000/api/profile/newexperience";
        const method = exp.id ? axios.put : axios.post;
        await method(
          url,
          { ...exp, token },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      toast.success("Experience updated!");
      setIsEditing(false);
      if (onDataChange) onDataChange();
    } catch (e) {
      toast.error("Update failed");
    }
  };

  return (
    <div
      className={`grid-card experience-card ${isEditing ? "is-editing" : ""}`}
    >
      <h3>Work Experience</h3>
      {isEditing ? (
        <>
          <div ref={containerRef}>
            {localFormData.map((exp, index) => (
              <div key={index} className="address-form-group">
                {/* Inputs for Designation, Company, Location, Dates */}
                <div className="form-rows">
                  <div className="form-group">
                    <label>Designation</label>
                    <input
                      type="text"
                      name="designation_name"
                      value={exp.designation_name || ""}
                      onChange={(e) => handleInputChange(index, e)}
                      list={`des-${index}`}
                      className="form-control"
                    />
                    <datalist id={`des-${index}`}>
                      {dropdownData.designations.map((d) => (
                        <option key={d.id} data-id={d.id} value={d.name} />
                      ))}
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      name="company_name"
                      value={exp.company_name || ""}
                      onChange={(e) => handleInputChange(index, e)}
                      list={`comp-${index}`}
                      className="form-control"
                    />
                    <datalist id={`comp-${index}`}>
                      {dropdownData.companies.map((c) => (
                        <option key={c.id} data-id={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div className="form-rows">
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="company_location"
                      value={exp.company_location || ""}
                      onChange={(e) => handleInputChange(index, e)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Joining</label>
                    <input
                      type="date"
                      name="joining_date"
                      value={
                        exp.joining_date
                          ? dayjs(exp.joining_date).format("YYYY-MM-DD")
                          : ""
                      }
                      onChange={(e) => handleInputChange(index, e)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Relieving</label>
                    <input
                      type="date"
                      name="relieving_date"
                      value={
                        exp.relieving_date
                          ? dayjs(exp.relieving_date).format("YYYY-MM-DD")
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
              <button onClick={handleAddExperience} className="add-btn">
                <MdAdd />
              </button>
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
          {experienceData.map((exp) => (
            <div key={exp.id} className="work-experience-item">
              <div className="experience-header">
                <h4>{exp.designation_name}</h4>
                <span className="experience-dates">
                  {dayjs(exp.joining_date).format("MMM YYYY")} -{" "}
                  {exp.relieving_date
                    ? dayjs(exp.relieving_date).format("MMM YYYY")
                    : "Present"}
                </span>
              </div>
              <p className="company-name">
                {exp.company_name} - {exp.company_location}
              </p>
            </div>
          ))}
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

export default ExperienceCard;
