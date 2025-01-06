import mysql from "mysql2";
import dbConfig from "../config/db.config";

const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  port: dbConfig.PORT,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
});

connection.connect((err) => {
  if (err) {
    console.error("Database connection failed with error:", err.message);
    console.error("Error Details:", err);
  } else {
    console.log("Successfully connected to the database.");
  }
});

export default connection;
