const express = require("express");
const cors = require("cors");
const path = require("path");
require('dotenv').config(); // 1. Itha mela kondu vanthuten (Best Practice)

const db = require("./db"); // Database connection
const app = express();
const PORT = 4000;

// 2. Increase Payload Limit (For Images/Files)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 3. Enable CORS (Updated for Vercel)
app.use(cors({
  origin: [
    "https://students-learning-web.vercel.app", // Unga Vercel App
    "http://localhost:3000",                    // Local React (Create React App)
    "http://localhost:5173"                     // Local React (Vite)
  ], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true // Cookies/Tokens allow panna ithu thevai
}));

// 4. Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

(async () => {
  try {
    // DB Connection Check (Optional debug log)
    console.log("⏳ Connecting to Database...");
    
    // Mount API Routes
    app.use("/api", require("./api/query/index"));

    app.listen(PORT, () => {
      console.log(`✅ Server running on Port: ${PORT}`);
      console.log(`✅ Database Status: Connected`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MySQL:", err);
  }
})();