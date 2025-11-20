import "./App.css";
// import '../output.css'
import { Route, Routes } from "react-router-dom";
import Login from "../pages/login";
import Home from "../pages/home";
import Layout from "./layout";
import ProfilePage from "../pages/ProfilePage";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Contact from "../pages/Contact";

import ProtectedRoute from "../components/proctedrouter";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
