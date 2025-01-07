import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export default {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USERNAME,
  PORT: Number(process.env.DB_PORT),
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
};
