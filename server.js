const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());

function createPool() {
  return mysql.createPool({
    host: "localhost",
    port: 6446,   // MySQL Router RW port
    user: "root",
    password: "innodb",
    database: "school",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

let pool = createPool();

pool.on("error", (err) => {
  console.error("MySQL Pool Error:", err.message);

  if (err.code === "PROTOCOL_CONNECTION_LOST" || 
      err.code === "ECONNRESET" || 
      err.code === "ER_CON_COUNT_ERROR") 
  {
    console.log("Reconnecting MySQL pool…");
    pool = createPool();
  }
});
console.log("API connected to MySQL via Router (RW port 6446)");


// GET All Students
app.get("/students", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM students");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// INSERT Student
app.post("/students", async (req, res) => {
  try {
    const { id, name } = req.body;
    await pool.query("INSERT INTO students (id, name) VALUES (?, ?)", [id, name]);
    res.json({ message: "Inserted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Single Student
app.get("/students/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM students WHERE id = ?",
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Student
app.delete("/students/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM students WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Student
app.put("/students/:id", async (req, res) => {
  try {
    const { name } = req.body;
    await pool.query(
      "UPDATE students SET name = ? WHERE id = ?",
      [name, req.params.id]
    );
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("API running on port 3000"));
