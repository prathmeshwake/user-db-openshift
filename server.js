const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");

const app = express();

/* ======================
   ENV VARIABLES
====================== */
const PORT = process.env.PORT || 8080;
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "userdb";
const DB_PASS = process.env.DB_PASS || "pass123";
const DB_NAME = process.env.DB_NAME || "usersdb";

/* ======================
   MIDDLEWARE
====================== */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* ======================
   STATIC FILES (IMPORTANT FIX)
====================== */
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ======================
   DATABASE CONNECTION
====================== */
const pool = new Pool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: 5432,
});

/* ======================
   INIT TABLE
====================== */
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100)
      )
    `);
    console.log("✅ users table ready");
  } catch (err) {
    console.error("❌ DB init error:", err);
  }
})();

/* ======================
   API ROUTES
====================== */

// Create user
app.post("/api/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2)",
      [name, email]
    );
    res.json({ message: "User added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB insert failed" });
  }
});

// Get users
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB fetch failed" });
  }
});

/* ======================
   SERVER START
====================== */
app.listen(PORT, () => {
  console.log(`🚀 User app running on port ${PORT}`);
});

