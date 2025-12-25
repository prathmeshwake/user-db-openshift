const express = require("express");
const { Pool } = require("pg");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 5432
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
initDB();

app.post("/api/users", async (req, res) => {
  const { name, email } = req.body;
  await pool.query(
    "INSERT INTO users(name, email) VALUES($1,$2)",
    [name, email]
  );
  res.json({ status: "saved" });
});

app.get("/api/users", async (req, res) => {
  const result = await pool.query("SELECT * FROM users ORDER BY id DESC");
  res.json(result.rows);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("User DB app running"));

