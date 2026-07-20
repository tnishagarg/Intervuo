import "dotenv/config";
import pool from "./config/db.js";

try {
  const [rows] = await pool.query("SHOW TABLES");
  console.log("Connected! Tables in database:", rows);
} catch (err) {
  console.error("Connection failed:", err.message);
}
process.exit();