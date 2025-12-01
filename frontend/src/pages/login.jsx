import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";
import loginImage from "../assets/loginimage.jpg";
import caddCentreLogo from "../assets/caddcentre.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  // State Variables
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactId, setContactId] = useState("");
  const [genderId, setGenderId] = useState("");
  const [genders, setGenders] = useState([]);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  // Ensure this is your correct backend URL (e.g. Cloudflare link)
  const base_api = "https://student-leaning.onrender.com/api";

  // Reset fields when switching tabs
  const handleTabChange = (tab) => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setContactId("");
    setGenderId("");
    setDateOfBirth("");
    setPassword("");
    setActiveTab(tab);
  };

  // Check Token on Load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (Date.now() > payload.exp * 1000) {
          localStorage.clear();
        } else {
          navigate("/home");
        }
      } catch {
        localStorage.clear();
      }
    }
  }, [navigate]);

  // Fetch Genders
  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const res = await axios.get(`${base_api}/location/genders`);
        setGenders(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGenders();
  }, [base_api]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${base_api}/login/login`, {
        email_id: email,
        password,
      });
      const data = res.data;
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "userName",
        `${data.user.first_name} ${data.user.last_name}`
      );
      toast.success("Welcome Back!");
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed");
    }
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const regData = {
        first_name: firstName,
        last_name: lastName,
        email_id: email,
        contact_no: contactId,
        gender_id: genderId,
        date_of_birth: dateOfBirth,
        password,
      };
      const res = await axios.post(`${base_api}/login/register`, regData);
      toast.success(res.data.message || "Registration Successful!");
      handleTabChange("login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${loginImage})` }}
    >
      <ToastContainer position="top-right" theme="light" />

      {/* --- SPLIT CARD LAYOUT --- */}
      <div className="split-card">
        {/* LEFT SIDEBAR */}
        <div className="card-sidebar">
          <img src={caddCentreLogo} alt="Logo" className="sidebar-logo" />

          <div className="nav-buttons">
            <button
              className={`side-btn ${activeTab === "login" ? "active" : ""}`}
              onClick={() => handleTabChange("login")}
            >
              LOGIN
            </button>
            <button
              className={`side-btn ${activeTab === "register" ? "active" : ""}`}
              onClick={() => handleTabChange("register")}
            >
              REGISTER
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT FORM */}
        <div className="card-main">
          {activeTab === "login" ? (
            <form onSubmit={handleLogin} autoComplete="off" className="p-4">
              <div className="login-input">
                <label className="input-label">Email / Mobile No</label>
                <input
                  type="text"
                  className="textarea"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="login-input">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  className="textarea"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="action-btn">
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} autoComplete="off">
              <div className="scrollable-form">
                {/* Name Row */}
                <div className="row" style={{ display: "flex", gap: "15px" }}>
                  <div className="login-input" style={{ flex: 1 }}>
                    <label className="input-label">First Name</label>
                    <input
                      type="text"
                      placeholder="First Name"
                      className="textarea"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="login-input" style={{ flex: 1 }}>
                    <label className="input-label">Last Name</label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="textarea"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="login-input">
                  <label className="input-label">Email</label>
                  <input
                    type="email"
                    placeholder="Enter Email"
                    className="textarea"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="login-input">
                  <label className="input-label">Contact Number</label>
                  <input
                    type="tel"
                    className="textarea"
                    placeholder="contact number"
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    required
                  />
                </div>

                {/* Details Row */}
                <div className="row" style={{ display: "flex", gap: "15px" }}>
                  <div className="login-input" style={{ flex: 1 }}>
                    <label className="input-label">Gender</label>
                    <select
                      className="textarea"
                      value={genderId}
                      onChange={(e) => setGenderId(e.target.value)}
                      required
                    >
                      <option value="">Select</option>
                      {genders.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.gender_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="login-input" style={{ flex: 1 }}>
                    <label className="input-label">DOB</label>
                    <input
                      type="date"
                      className="textarea"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="login-input">
                  <label className="input-label">Password</label>
                  <input
                    type="password"
                    placeholder="password"
                    className="textarea"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="action-btn">
                Register
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
