import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import loginImage from "../assets/loginimage.jpg";
import caddCentreLogo from "../assets/caddcentre.svg";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactId, setContactId] = useState("");
  const [genderId, setGenderId] = useState("");
  const [genders, setGenders] = useState([]);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");

  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();

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
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home"); 
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:7000/api/login/login",
        {
          email_id: email,
          password: password,
        }
      );

      const data = response.data;

      localStorage.setItem("token", data.token);
      setEmail("");
      setPassword("");
      navigate("/home");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(
          err.response.data.message || "An error occurred during login."
        );
      } else {
        toast.error("Could not connect to the server. Please try again later.");
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const registrationData = {
      first_name: firstName,
      last_name: lastName,
      email_id: email,
      contact_no: contactId,
      gender_id: genderId,
      date_of_birth: dateOfBirth,
      password: password,
    };

    try {
      const response = await axios.post(
        "http://localhost:7000/api/login/register",
        registrationData
      );

      toast.success(
        response.data.message || "Registration successful! Please login."
      );

      navigate("/home");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || "Registration failed. Please try again.");
      } else {
        toast.error("Could not connect to the server. Please try again later.");
      }
    }
  };

  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const response = await axios.get("http://localhost:7000/api/location/genders");
        setGenders(response.data);
      } catch (error) {
        console.error("Failed to fetch genders:", error);
        toast.error("Could not load gender options.");
      }
    };

    fetchGenders();
  }, []);

  return (
    <div
      className="d-flex align-items-center justify-content-center h-100"
      style={{
        backgroundImage: `url(${loginImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div
        className="card"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
          borderRadius: "15px",
          padding: "40px 50px",
          width: "100%",
          maxWidth: "500px",
          textAlign: "center",
          animation: "fadeIn 0.5s ease-out",
        }}
      >
        <div className="card-body justify-content-center d-flex flex-column p-0">
          <div className="text-center">
            <img
              src={caddCentreLogo}
              alt="CADD Centre Logo"
              style={{
                maxHeight: "70px",
                marginBottom: "25px",
              }}
            />
          </div>
          <div className="tab-switcher">
            <button
              className={`tab-button ${activeTab === "login" ? "active" : ""}`}
              onClick={() => handleTabChange("login")}
            >
              LOGIN
            </button>
            <button
              className={`tab-button ${activeTab === "register" ? "active" : ""
                }`}
              onClick={() => handleTabChange("register")}
            >
              REGISTER
            </button>
          </div>
          {activeTab === "login" ? (
            <form
              autoComplete="off"
              onSubmit={handleLogin}
              className="h-100 justify-content-between d-flex flex-column text-center"
            >
              <div>
                <div className=" mb-3 d-flex flex-column align-items-start">
                  <div className="py-2 text-dark">
                    <label className="fw-blod">Email/Mobile No</label>
                  </div>
                  <div className="w-100">
                    <input
                      type="text"
                      className="textarea border-0 w-100 p-2 rounded-3"
                      placeholder="Email/Mobile No"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="off"
                      readOnly={true}
                      onFocus={(e) => e.target.removeAttribute("readOnly")}
                    />
                  </div>
                </div>
                <div className="mb-4 d-flex flex-column align-items-start">
                  <div className="py-2 text-dark">
                    <label>Password</label>
                  </div>
                  <div className="w-100">
                    <input
                      type="password"
                      className="textarea border-0 w-100 p-2 rounded-3"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="off"
                      readOnly={true}
                      onFocus={(e) => e.target.removeAttribute("readOnly")}
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-center pt-3">
                <button
                  type="submit"
                  className="btn btn-danger text-center rounded-4 btn-md px-5 py-2 fw-bold text-center align-top"
                >
                  Sign In
                </button>
              </div>
            </form>
          ) : (
            <form
              autoComplete="off"
              onSubmit={handleRegister}
              className="h-100 justify-content-between d-flex flex-column text-center"
            >
              <div className="register-content">
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="d-flex flex-column align-items-start">
                      <div className="py-2 text-dark">
                        <label>First Name</label>
                      </div>
                      <div className="w-100">
                        <input
                          type="text"
                          className="textarea border-0 w-100 p-2 rounded-3"
                          placeholder="First Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="d-flex flex-column align-items-start">
                      <div className="py-2 text-dark">
                        <label>Last Name</label>
                      </div>
                      <div className="w-100">
                        <input
                          type="text"
                          className="textarea border-0 w-100 p-2 rounded-3"
                          placeholder="Last Name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4 d-flex flex-column align-items-start">
                  <div className="py-2 text-dark">
                    <label>Email</label>
                  </div>
                  <div className="w-100">
                    <input
                      type="email"
                      className="textarea border-0 w-100 p-2 rounded-3"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4 d-flex flex-column align-items-start">
                  <div className="py-2 text-dark">
                    <label>Contact Number</label>
                  </div>
                  <div className="w-100">
                    <input
                      type="tel"
                      className="textarea border-0 w-100 p-2 rounded-3"
                      placeholder="Contact Number"
                      value={contactId}
                      onChange={(e) => setContactId(e.target.value)}
                      required
                      autoComplete="off"
                      readOnly={true}
                      onFocus={(e) => e.target.removeAttribute("readOnly")}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="d-flex flex-column align-items-start">
                      <div className="py-2 text-dark">
                        <label>Gender</label>
                      </div>
                      <select
                        className="form-select textarea border-0 w-100 p-2 rounded-3"
                        value={genderId}
                        onChange={(e) => setGenderId(e.target.value)}
                        required
                      >
                        <option value="">Select Gender</option>
                        {genders.map((gender) => (
                          <option key={gender.id} value={gender.id}>
                            {gender.gender_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="d-flex flex-column align-items-start">
                      <div className="py-2 text-dark">
                        <label>Date of Birth</label>
                      </div>
                      <input
                        type="date"
                        className="textarea border-0 w-100 p-2 rounded-3"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4 d-flex flex-column align-items-start">
                  <div className="py-2 text-dark">
                    <label>Password</label>
                  </div>
                  <div className="w-100">
                    <input
                      type="password"
                      className="textarea border-0 w-100 p-2 rounded-3"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="off"
                      readOnly={true}
                      onFocus={(e) => e.target.removeAttribute("readOnly")}
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-center pt-3">
                <button
                  type="submit"
                  className="btn btn-danger text-center rounded-4 btn-md px-5 py-2 fw-bold text-center align-top"
                >
                  Register
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
