/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ProfilePage.css";
import profileImage from "../assets/profilepic.png";

import ProfilePicCard from "../components/profile/ProfilePicCard";
import ContactCard from "../components/profile/ContactCard";
import HeaderCard from "../components/profile/HeaderCard";
import PersonalInfoCard from "../components/profile/PersonalInfoCard";
import ExperienceCard from "../components/profile/ExperienceCard";
import EducationCard from "../components/profile/EducationCard";
import SkillsCard from "../components/profile/SkillsCard";
import dayjs from "dayjs";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [experienceData, setExperienceData] = useState([]);
  const [educationData, setEducationData] = useState([]);
  const [profilePic, setProfilePic] = useState(profileImage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeEditingCard, setActiveEditingCard] = useState(null);
  const handleEditStart = (cardName) => {
    setActiveEditingCard(cardName);
  };
  const handleEditEnd = () => {
    setActiveEditingCard(null);
  };
  const educationsContainerRef = useRef(null);
  const experiencesContainerRef = useRef(null);
  const addressesContainerRef = useRef(null);

  const fetchAllData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found.");
      setLoading(false);
      return;
    }

    try {
      const [profileRes, expRes, eduRes] = await Promise.all([
        axios.post("http://localhost:7000/api/profile/show", { token }),
        axios.post("http://localhost:7000/api/profile/experience", { token }),
        axios.post("http://localhost:7000/api/profile/geteducation", { token }),
      ]);

      setProfileData(profileRes.data);
      setExperienceData(expRes.data);
      setEducationData(eduRes.data);

      try {
        const picRes = await axios.post(
          "http://localhost:7000/api/profile/getProfilePic",
          { token },
          { responseType: "blob" }
        );
        setProfilePic(URL.createObjectURL(picRes.data));
      } catch (err) {
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  if (loading) return <div className="loading-error-message">Loading...</div>;
  if (error) return <div className="loading-error-message error">{error}</div>;
  if (!profileData) return <div className="loading-error-message">No Data</div>;

  return (
    <div
      className={`profile-page-wrapper ${
        activeEditingCard ? "editing-active" : ""
      }`}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="profile-grid-container">
        <div className="left-column">
          <ProfilePicCard
            profilePic={profilePic}
            setProfilePic={setProfilePic}
            defaultImage={profileImage}
          />
          <ContactCard
            profileData={profileData}
            onDataChange={fetchAllData}
            onEditStart={() => handleEditStart("contact")}
            onEditEnd={handleEditEnd}
          />

          <EducationCard
            educationData={educationData}
            onDataChange={fetchAllData}
            containerRef={educationsContainerRef}
            onEditStart={() => handleEditStart("education")}
            onEditEnd={handleEditEnd}
          />
        </div>

        <div className="right-column">
          <HeaderCard
            profileData={profileData}
            onDataChange={fetchAllData}
            onEditStart={() => handleEditStart("header")}
            onEditEnd={handleEditEnd}
          />

          <SkillsCard
            onDataChange={fetchAllData}
            onEditStart={() => handleEditStart("skills")}
            onEditEnd={handleEditEnd}
          />

          <PersonalInfoCard
            profileData={profileData}
            onDataChange={fetchAllData}
            formatDate={formatDate}
            containerRef={addressesContainerRef}
            onEditStart={() => handleEditStart("personalInfo")}
            onEditEnd={handleEditEnd}
          />

          <ExperienceCard
            experienceData={experienceData}
            onDataChange={fetchAllData}
            containerRef={experiencesContainerRef}
            formatDate={formatDate}
            onEditStart={() => handleEditStart("experience")}
            onEditEnd={handleEditEnd}
          />
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
