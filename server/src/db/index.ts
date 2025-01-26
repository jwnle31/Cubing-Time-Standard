import mysql from "mysql2";
import dbConfig from "../config/db.config";

const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  port: dbConfig.PORT,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the pool on initialization
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    } else if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has too many connections.");
    } else if (err.code === "ECONNREFUSED") {
      console.error("Database connection was refused.");
    } else {
      console.error("Unexpected database connection error:", err.message);
    }
  }

  if (connection) {
    console.log("Successfully connected to the database.");
    connection.release(); // Release the connection back to the pool
  }
});

// Export a promise-based pool for async/await queries
export default pool.promise();
