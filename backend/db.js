const mysql = require("mysql2/promise");
const path = require('path');


require('dotenv').config({ path: path.resolve(__dirname, './.env') }); 

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
      rejectUnauthorized: false // Fixes the "Self-signed certificate" error
  }
});

// Test the connection immediately when this file loads
db.getConnection()
    .then(connection => {
        console.log("✅ SUCCESS: Connected to TiDB Cloud!");
        connection.release();
    })
    .catch(err => {
        console.error("❌ ERROR: Could not connect to TiDB.");
        console.error("Details:", err.message);
    });

module.exports = db;