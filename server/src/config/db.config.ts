import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export default {
  HOST: "mysql-10e17dc4-cubing-stats.g.aivencloud.com",
  USER: "avnadmin",
  PORT: 17828,
  PASSWORD: "AVNS_RP96LnKw5fYtEmvGgjE",
  DB: "defaultdb",
};
