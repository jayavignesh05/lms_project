const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const promisePool = require("../../db");

const JWT_SECRET = "ZXERE235SSF";

router.post("/register", async (req, res) => {
  console.log("🔥 Request hit the Register route!");
  const {
    first_name,
    last_name,
    email_id,
    contact_no,
    gender_id,
    date_of_birth,
    password,
  } = req.body;

  if (
    !first_name ||
    !last_name ||
    !email_id ||
    !password ||
    !contact_no ||
    !gender_id ||
    !date_of_birth
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // --- STEP 1: CHECK IF USER ALREADY EXISTS ---
    // Before inserting, check if this email or phone is already in the DB.
    const checkSql = "SELECT id FROM users WHERE email_id = ? OR contact_no = ?";
    const [existingUser] = await promisePool.query(checkSql, [email_id, contact_no]);

    if (existingUser.length > 0) {
      // If user exists, STOP here. Do NOT save to DB.
      return res.status(400).json({ message: "Email or Contact number already exists!" });
    }

    // --- STEP 2: IF NEW USER, THEN INSERT ---
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql =
      "INSERT INTO users (first_name, last_name, email_id, contact_no, gender_id, date_of_birth, password) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    const [result] = await promisePool.query(sql, [
      first_name,
      last_name,
      email_id,
      contact_no,
      gender_id,
      date_of_birth,
      hashedPassword,
    ]);

    res.status(200).json({
      status: 200,
      message: "User registered successfully.",
      userId: result.insertId,
    });

  } catch (err) {
    console.error("Register Error:", err);
    // This catches database connection errors or syntax errors.
    res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
});
router.post("/login", async (req, res) => {
  const { email_id: identifier, password } = req.body;

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ message: "Email/Contact and password are required." });
  }

  try {
    // 1. UPDATE: Select first_name and last_name
    const sql =
      "SELECT id, email_id, password, first_name, last_name FROM users WHERE email_id = ? OR contact_no = ?";
    const [rows] = await promisePool.query(sql, [identifier, identifier]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const token = jwt.sign(
        { id: user.id, email: user.email_id },
        JWT_SECRET,
        { expiresIn: "18h" }
      );

      // 2. UPDATE: Send user details in response
      res.status(200).json({
        status: 200,
        message: "Login successful.",
        token: token,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email_id,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid credentials." });
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  // This route is now /data
  try {
    const [genders] = await promisePool.query(
      "SELECT id, gender_name FROM gender"
    );
    res.status(200).json(genders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch data." });
  }
});

module.exports = router;
