/* eslint-disable no-unused-vars */
import React, { useState, useRef } from "react";
import { MdOutlineEdit, MdCheck, MdClear, MdAdd } from "react-icons/md";
import { CiCalendar } from "react-icons/ci";
import { BsGenderAmbiguous } from "react-icons/bs";
import { IoLocationOutline } from "react-icons/io5";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const PersonalInfoCard = ({ profileData, onDataChange, formatDate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [dropdowns, setDropdowns] = useState({
    genders: [],
    countries: [],
    states: [],
  });
  const containerRef = useRef(null);

  const fetchDropdowns = async () => {
    const [gen, count] = await Promise.all([
      axios.get("http://localhost:7000/api/location/genders"),
      axios.get("http://localhost:7000/api/location/countries"),
    ]);
    setDropdowns((prev) => ({
      ...prev,
      genders: gen.data,
      countries: count.data,
    }));
  };

  const fetchStates = async (countryId) => {
    if (!countryId) {
      setDropdowns((prev) => ({ ...prev, states: [] }));
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:7000/api/location/states",
        { country_id: countryId }
      );
      setDropdowns((prev) => ({ ...prev, states: res.data }));
    } catch {
      setDropdowns((prev) => ({ ...prev, states: [] }));
    }
  };

  const handleEditClick = async () => {
    await fetchDropdowns();
    const dob = profileData.date_of_birth
      ? dayjs(profileData.date_of_birth).format("YYYY-MM-DD")
      : "";

    setFormData({
      ...profileData,
      email_id: profileData.email,
      date_of_birth: dob,
      addresses: profileData.addresses.map((addr) => ({ ...addr })), // Deep copy
    });

    if (profileData.addresses?.length > 0) {
      fetchStates(profileData.addresses[0].countries_id);
    }
    setIsEditing(true);
  };

  const handleAddAddress = () => {
    setFormData((prev) => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        { label: "New Address", countries_id: "", state_id: "" },
      ],
    }));
    setTimeout(
      () =>
        containerRef.current?.lastElementChild?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        }),
      100
    );
  };

  const handleAddressChange = (index, e) => {
    const { name, value } = e.target;
    const newAddrs = [...formData.addresses];
    newAddrs[index] = { ...newAddrs[index], [name]: value };
    setFormData((prev) => ({ ...prev, addresses: newAddrs }));
    if (name === "countries_id") fetchStates(value);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:7000/api/profile/update", {
        ...formData,
        token,
      });
      toast.success("Personal info updated!");
      setIsEditing(false);
      if (onDataChange) onDataChange();
    } catch (e) {
      toast.error("Update failed");
    }
  };

  return (
    <div
      className={`grid-card profile-summary-card ${
        isEditing ? "is-editing" : ""
      }`}
    >
      <h3>Personal Information</h3>
      {isEditing ? (
        <>
          <div className="form-group">
            <label>Gender</label>
            <select
              name="gender_id"
              value={formData.gender_id || ""}
              onChange={(e) =>
                setFormData({ ...formData, gender_id: e.target.value })
              }
              className="form-control"
            >
              <option value="">Select Gender</option>
              {dropdowns.genders.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.gender_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth || ""}
              onChange={(e) =>
                setFormData({ ...formData, date_of_birth: e.target.value })
              }
              className="form-control"
            />
          </div>
          <hr className="form-divider" />
          <div className="address-edit-header">
            <h4>Addresses</h4>
          </div>
          <div ref={containerRef}>
            {formData.addresses &&
              formData.addresses.map((addr, index) => (
                <div key={index} className="address-form-group">
                  <div className="form-group">
                    <label>Door No</label>
                    <input
                      type="text"
                      name="door_no"
                      value={addr.door_no || ""}
                      onChange={(e) => handleAddressChange(index, e)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Street</label>
                    <input
                      type="text"
                      name="street"
                      value={addr.street || ""}
                      onChange={(e) => handleAddressChange(index, e)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Area</label>
                    <input
                      type="text"
                      name="area"
                      value={addr.area || ""}
                      onChange={(e) => handleAddressChange(index, e)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={addr.city || ""}
                      onChange={(e) => handleAddressChange(index, e)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={addr.pincode || ""}
                      onChange={(e) => handleAddressChange(index, e)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <select
                      name="countries_id"
                      value={addr.countries_id || ""}
                      onChange={(e) => handleAddressChange(index, e)}
                      className="form-control"
                    >
                      <option value="">Select</option>
                      {dropdowns.countries.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <select
                      name="state_id"
                      value={addr.state_id || ""}
                      onChange={(e) => handleAddressChange(index, e)}
                      className="form-control"
                      disabled={!addr.countries_id}
                    >
                      <option value="">Select</option>
                      {dropdowns.states.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
          </div>
          <div className="header-actions">
            <div className="edit-controls">
              <button onClick={handleAddAddress} className="add-btn">
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
          <div className="contact-item">
            <BsGenderAmbiguous />
            <span>{profileData.gender || "N/A"}</span>
          </div>
          <div className="contact-item">
            <CiCalendar />
            <span>{formatDate(profileData.date_of_birth)}</span>
          </div>
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
          >
            <div className="contact-item">
              <IoLocationOutline />
            </div>
            <div>
              {profileData.addresses?.map((addr) => (
                <div key={addr.address_id} className="address-item">
                  <div>
                    {addr.door_no}, {addr.street}
                  </div>
                  <div>
                    {addr.area}, {addr.city} - {addr.pincode}
                  </div>
                  <div>
                    {addr.state_name}, {addr.country_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
export default PersonalInfoCard;
