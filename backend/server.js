const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db"); // Database connection
const app = express();
const PORT = 4000;
require('dotenv').config();

// 1. Increase Payload Limit (For Images/Files)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 2. Enable CORS for ALL origins (Fixes Dev Tunnel Issue)
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 3. Static Files
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