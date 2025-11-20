const express = require("express");
const router = express.Router();
const promisePool = require("../../db");
const verifyToken = require("../middleware/verifyToken");
const jwt = require('jsonwebtoken');
const showProfile = async (req, res) => {
  const userId = req.userId;
  try {
    const sql = `
      SELECT 
          u.id AS user_id, u.first_name, u.last_name, u.email_id, u.contact_no, u.date_of_birth, u.current_status_id, u.linkedin_url,
          a.id AS address_id, a.address, a.door_no, 
          a.street, a.area, a.city, a.pincode, a.countries_id, a.state_id,
          g.gender_name, g.id AS gender_id,
          cs.name AS current_status_name,
          c.name AS country_name, s.name AS state_name
      FROM users AS u
      LEFT JOIN gender AS g ON u.gender_id = g.id
      LEFT JOIN current_status AS cs ON u.current_status_id = cs.id
      LEFT JOIN addresses AS a ON u.id = a.user_id
      LEFT JOIN countries AS c ON a.countries_id = c.id
      LEFT JOIN states AS s ON a.state_id = s.id
      WHERE u.id = ?;
    `;
    const [results] = await promisePool.query(sql, [userId]);
    if (results.length === 0) return res.status(404).json({ error: "User not found" });

    const userProfile = {
      user_id: results[0].user_id,
      first_name: results[0].first_name,
      last_name: results[0].last_name,
      email: results[0].email_id,
      contact_no: results[0].contact_no,
      linkedin_url: results[0].linkedin_url,
      gender: results[0].gender_name,
      gender_id: results[0].gender_id,
      date_of_birth: results[0].date_of_birth,
      current_status_id: results[0].current_status_id,
      current_status_name: results[0].current_status_name,
      addresses: [],
    };

    results.forEach((row) => {
      if (row.address_id) {
        userProfile.addresses.push({
          address_id: row.address_id,
          label: row.address,
          door_no: row.door_no,
          street: row.street,
          area: row.area,
          city: row.city,
          pincode: row.pincode,
          country_name: row.country_name,
          countries_id: row.countries_id,
          state_name: row.state_name,
          state_id: row.state_id,
        });
      }
    });
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ error: "Database query failed" });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.userId;
  const {
    first_name,
    last_name,
    email_id,
    contact_no,
    linkedin_url,
    gender_id,
    date_of_birth,
    current_status_id,
    addresses,
  } = req.body;

  const connection = await promisePool.getConnection();

  try {
    await connection.beginTransaction();

    const userUpdateSql = `
        UPDATE users 
        SET first_name = ?, last_name = ?, email_id = ?, contact_no = ?, linkedin_url = ?, gender_id = ?, date_of_birth = ?, current_status_id = ?
        WHERE id = ?;
    `;
    
    await connection.query(userUpdateSql, [
      first_name,
      last_name,
      email_id,
      contact_no,
      linkedin_url || null,
      gender_id || null,
      date_of_birth || null,
      current_status_id || null,
      userId,
    ]);

    if (addresses && Array.isArray(addresses)) {
      for (const address of addresses) {
        if (address.address_id) {
          const addressUpdateSql = `
                UPDATE addresses 
                SET address = ?, door_no = ?, street = ?, area = ?, city = ?, pincode = ?, countries_id = ?, state_id = ?
                WHERE id = ? AND user_id = ?;
            `;
          await connection.query(addressUpdateSql, [
            address.label,
            address.door_no,
            address.street,
            address.area,
            address.city,
            address.pincode,
            address.countries_id,
            address.state_id,
            address.address_id,
            userId,
          ]);
        } else {
          const addressInsertSql = `
                INSERT INTO addresses (user_id, address, door_no, street, area, city, pincode, countries_id, state_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            `;
          await connection.query(addressInsertSql, [
            userId,
            address.label,
            address.door_no,
            address.street,
            address.area,
            address.city,
            address.pincode,
            address.countries_id,
            address.state_id,
          ]);
        }
      }
    }

    await connection.commit();
    res.status(200).json({ message: "Profile and addresses updated successfully." });
  } catch (error) {
    await connection.rollback();
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: "Database query failed during profile update." });
  } finally {
    connection.release();
  }
};

const insertProfile = async (req, res) => {
  const {
    first_name,
    last_name,
    email_id,
    contact_no,
    linkedin_url,
    gender_id,
    date_of_birth,
    current_status_id,
    password,
    addresses,
  } = req.body;

  if (!first_name || !last_name || !email_id || !password || !contact_no) {
    return res.status(400).json({ message: "Required user fields are missing." });
  }

  const connection = await promisePool.getConnection();

  try {
    await connection.beginTransaction();

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const userInsertSql =
      "INSERT INTO users (first_name, last_name, email_id, contact_no, linkedin_url, gender_id, date_of_birth, current_status_id, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    const [userResult] = await connection.query(userInsertSql, [
      first_name,
      last_name,
      email_id,
      contact_no,
      linkedin_url || null,
      gender_id || null,
      date_of_birth || null,
      current_status_id || null,
      hashedPassword,
    ]);
    const newUserId = userResult.insertId;

    if (addresses && Array.isArray(addresses)) {
      for (const address of addresses) {
        const addressInsertSql = `
          INSERT INTO addresses (user_id, address, door_no, street, area, city, pincode, countries_id, state_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        await connection.query(addressInsertSql, [
          newUserId,
          address.label,
          address.door_no,
          address.street,
          address.area,
          address.city,
          address.pincode,
          address.countries_id,
          address.state_id,
        ]);
      }
    }

    await connection.commit();
    res.status(201).json({ message: "Profile created successfully.", userId: newUserId });
  } catch (error) {
    await connection.rollback();
    console.error("Profile insert transaction error:", error);
    res.status(500).json({ error: "Database query failed during profile creation." });
  } finally {
    connection.release();
  }
};

const getEducation = async (req, res) => {
  const userId = req.userId;

  try {
    const sql = `
        SELECT 
            E.id,
            E.graduation_date,
            d.name AS name,
            E.institute_id,
            i.name AS institute_name,
            E.location AS institute_location,
            E.degree_id
        FROM 
            user_education AS E
        LEFT JOIN 
            institutes AS i ON E.institute_id = i.id
        LEFT JOIN
            degrees AS d ON E.degree_id = d.id

        WHERE 
            E.user_id = ?
        ORDER BY 
            E.graduation_date DESC;
    `;

    const [results] = await promisePool.query(sql, [userId]);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Database query failed" });
  }
};

const insertEducation = async (req, res) => {
  const userId = req.userId;
  let {
    institute_name,
    institute_location,
    institute_id,
    degree_id,
    graduation_date,
    location_id,
  } = req.body;

  const degree_name = req.body.name;

  if (!degree_id || !graduation_date) {
    return res.status(400).json({
      message:
        "Required education fields (degree_id, graduation_date) are missing.",
    });
  }

  try {
    let instituteId = institute_id;

    const sql = `
      INSERT INTO user_education (user_id, institute_id, degree_id, graduation_date, location)
      VALUES (?, ?, ?, ?, ?);
    `;
    const [result] = await promisePool.query(sql, [
      userId,
      institute_id,
      degree_id,
      new Date(graduation_date).toISOString().slice(0, 10),
      institute_location,
    ]);

    res.status(201).json({
      message: "Education added successfully.",
      educationId: result.insertId,
    });
  } catch (error) {
    console.error("Error inserting education:", error);
    res.status(500).json({ error: "Database query failed" });
  }
};

const updateEducation = async (req, res) => {
  const userId = req.userId;
  const { id, institute_id, degree_id, graduation_date, location } = req.body;

  try {
    const sql = `
      UPDATE user_education 
      SET institute_id = ?, degree_id = ?, graduation_date = ?, location = ?
      WHERE id = ? AND user_id = ?;
    `;
    await promisePool.query(sql, [
      institute_id,
      degree_id,
      new Date(graduation_date).toISOString().slice(0, 10),
      location,
      id,
      userId,
    ]);

    res
      .status(200)
      .json({ message: "Education details updated successfully." });
  } catch (error) {
    console.error("Error updating education:", error);
    res
      .status(500)
      .json({ error: "Database query failed during education update.", details: error.message });
  }
};

const getExperience = async (req, res) => {
  const userId = req.userId;

  try {
    const sql = `
        SELECT 
            E.id,
            E.joining_date,
            E.relieving_date,
            E.company_id,
            c.name AS company_name,
            E.company_location,
            E.designation_id,
            d.name as designation_name
        FROM 
            user_experience AS E
        LEFT JOIN 
            companies AS c ON E.company_id = c.id
        LEFT JOIN
            designations AS d ON E.designation_id = d.id
        WHERE 
            E.user_id = ?
        ORDER BY 
            E.joining_date DESC;
    `;

    const [results] = await promisePool.query(sql, [userId]);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Database query failed" });
  }
};

const insertExperience = async (req, res) => {
  const userId = req.userId;
  const {
    company_id,
    designation_id,
    joining_date,
    relieving_date,
    company_location,
  } = req.body;

  if (!designation_id || !joining_date) {
    return res.status(400).json({
      message:
        "Required experience fields (designation_id, joining_date) are missing.",
    });
  }

  try {
    const sql = `
      INSERT INTO user_experience (user_id, company_id, designation_id, joining_date, relieving_date, company_location)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    const [result] = await promisePool.query(sql, [
      userId,
      company_id,
      designation_id,
      joining_date,
      relieving_date || null,
      company_location,
    ]);

    res.status(201).json({
      message: "Experience added successfully.",
      experienceId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ error: "Database query failed", details: error.message });
  }
};

const updateExperience = async (req, res) => {
  const userId = req.userId;
  const { id, company_id, designation_id, joining_date, relieving_date, company_location } = req.body;

  if (!id || !company_id || !designation_id || !joining_date) {
    return res
      .status(400)
      .json({ message: "Required experience fields are missing for update." });
  }

  try {
    const sql = `
      UPDATE user_experience
      SET company_id = ?, designation_id = ?, joining_date = ?, relieving_date = ?, company_location = ?
      WHERE id = ? AND user_id = ?;
    `;
    await promisePool.query(sql, [
      company_id,
      designation_id,
      new Date(joining_date).toISOString().slice(0, 10),
      relieving_date ? new Date(relieving_date).toISOString().slice(0, 10) : null,
      company_location,
      id,
      userId,
    ]);

    res
      .status(200)
      .json({ message: "Experience details updated successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Database query failed during experience update." });
  }
};

const addProfilePic = async (req, res) => {
  try {
    const { token, mime_type, file_data } = req.body;

    if (!token) return res.status(401).json({ error: "Token is required" });

    jwt.verify(token, 'ZXERE235SSF', async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }

      const user_id = decoded.id;

      if (!file_data || !mime_type) {
        return res
          .status(400)
          .json({ error: "file_data and mime_type are required" });
      }

      const buffer = Buffer.from(file_data, "base64");

      await promisePool.query(
          `INSERT INTO user_profile_pics (user_id, mimetype, profile_pic)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE
             mimetype = VALUES(mimetype),
             profile_pic = VALUES(profile_pic)`,
          [user_id, mime_type, buffer]
        );

      res.json({ message: "Profile picture updated successfully!" });
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to save profile picture", details: err.message });
  }
};

const getProfilePic = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(401).json({ error: "Token is required" });

    jwt.verify(token, 'ZXERE235SSF', async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }

      const user_id = decoded.id;

      const [rows] = await promisePool.query("SELECT profile_pic, mimetype FROM user_profile_pics WHERE user_id = ?", [user_id]);

      if (rows.length === 0) return res.status(404).json({ error: "No image found" });

      res.set("Content-Type", rows[0].mimetype);
      res.send(rows[0].profile_pic);
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch profile picture",
      details: err.message,
    });
  }
};

router.post("/show", verifyToken, showProfile);
router.put("/update", verifyToken, updateProfile);
router.post("/create", insertProfile);
router.post("/geteducation", verifyToken, getEducation);
router.post("/neweducation", verifyToken, insertEducation);
router.put("/updateeducation", verifyToken, updateEducation);
router.post("/experience", verifyToken, getExperience);
router.post("/newexperience", verifyToken, insertExperience);
router.put("/updateexperience", verifyToken, updateExperience);
router.post("/addProfilePic", addProfilePic);
router.post("/getProfilePic", getProfilePic);

module.exports = router;
