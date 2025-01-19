import mysql from "mysql2/promise";
import axios from "axios";
import unzipper from "unzipper";
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";
import { createReadStream } from "fs";
import { createInterface } from "readline";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const {
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_PORT,
  DB_NAME,
  EXPORT_FOLDER,
  EXPORT_URL,
  SSL_MODE,
} = process.env;

if (
  !DB_HOST ||
  !DB_USERNAME ||
  !DB_PASSWORD ||
  !DB_PORT ||
  !DB_NAME ||
  !EXPORT_URL ||
  !EXPORT_FOLDER ||
  !SSL_MODE
) {
  throw new Error(
    "Missing required environment variables. Please check your .env file."
  );
}

export async function populateDatabase(): Promise<void> {
  let connection: mysql.Connection | null = null;

  try {
    // Download the latest export
    console.log("Downloading the latest export...");
    const response = await axios({
      method: "GET",
      url: EXPORT_URL,
      responseType: "stream",
    });

    const export_folder = path.resolve(__dirname, EXPORT_FOLDER + "");
    const export_zip = path.resolve(
      __dirname,
      EXPORT_FOLDER + "WCA_export.zip"
    );

    fs.ensureDirSync(export_folder);

    console.log(export_zip);
    const writer = fs.createWriteStream(export_zip);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log("Download complete.");
    console.log(`Extracting ${export_zip}...`);

    await fs
      .createReadStream(export_zip)
      .pipe(unzipper.Extract({ path: export_folder }))
      .promise();

    console.log("Extraction complete. Deleting ZIP file.");
    fs.unlinkSync(export_zip);

    console.log("Cleaning up unnecessary files...");
    const files = await fs.readdir(export_folder);

    for (const file of files) {
      if (file !== "WCA_export.sql") {
        console.log(`Removing file: ${file}`);
        await fs.unlink(path.join(export_folder, file));
      }
    }

    console.log("Cleanup complete. Only WCA_export.sql remains.");

    const connectionOptions: any = {
      host: DB_HOST,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      port: Number(DB_PORT),
      database: DB_NAME,
      charset: "utf8mb4_unicode_ci",
    };

    connection = await mysql.createConnection(connectionOptions);

    await connection.query("SET SESSION sql_require_primary_key = 0;");

    console.log("Starting transaction...");
    await connection.query("START TRANSACTION;");

    // Execute the SQL file line by line
    await executeSqlFile(
      connection,
      path.resolve(__dirname, EXPORT_FOLDER + "WCA_export.sql")
    );

    await connection.query("SET SQL_SAFE_UPDATES = 0;");
    await connection.query("ALTER TABLE RanksSingle ADD COLUMN pr FLOAT;");
    await connection.query(`
      UPDATE RanksSingle r
      JOIN (
        SELECT 
          personId,
          eventId,
          PERCENT_RANK() OVER (PARTITION BY eventId ORDER BY best ASC) AS calculated_percent_rank
        FROM RanksSingle
      ) er ON r.eventId = er.eventId AND r.personId = er.personId
      SET r.pr = er.calculated_percent_rank;
    `);
    await connection.query("ALTER TABLE RanksAverage ADD COLUMN pr FLOAT;");
    await connection.query(`
      UPDATE RanksAverage r
      JOIN (
        SELECT 
          personId,
          eventId,
          PERCENT_RANK() OVER (PARTITION BY eventId ORDER BY best ASC) AS calculated_percent_rank
        FROM RanksAverage
      ) er ON r.eventId = er.eventId AND r.personId = er.personId
      SET r.pr = er.calculated_percent_rank;
    `);

    console.log("Committing transaction...");
    await connection.query("COMMIT;");
    console.log("Database populated successfully.");
  } catch (error: any) {
    console.error("An error occurred:", error.message);
    if (connection) {
      console.log("Rolling back transaction due to error...");
      await connection.query("ROLLBACK;"); // Rollback in case of error
    }
  } finally {
    if (connection) {
      console.log("Closing connection...");
      await connection.end();
    }

    const sqlFilePath = path.resolve(
      __dirname,
      EXPORT_FOLDER + "WCA_export.sql"
    );
    try {
      if (await fs.pathExists(sqlFilePath)) {
        console.log(`Deleting SQL file: ${sqlFilePath}`);
        await fs.unlink(sqlFilePath);
      }
    } catch (error: unknown) {
      console.error("Error deleting WCA_export.sql:", error);
    }
  }
}

async function executeSqlFile(
  connection: mysql.Connection,
  sqlFilePath: string
) {
  const fileStream = createReadStream(sqlFilePath, "utf8");
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let sqlQuery = "";
  let lineNumber = 0;

  for await (const line of rl) {
    lineNumber++;
    let trimmedLine = line.trim();

    // Skip lines that are comments or empty
    if (
      trimmedLine === "" ||
      trimmedLine.startsWith("--") ||
      trimmedLine.startsWith("/*")
    ) {
      continue;
    }

    // Append the line to the current SQL query
    sqlQuery += trimmedLine + " ";

    // If the query ends with a semicolon, execute it
    if (sqlQuery.trim().endsWith(";")) {
      try {
        await connection.query(sqlQuery.trim());
        console.log(`Executed query ending at line ${lineNumber}`);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error executing SQL:", error.message);
          throw error; // Re-throw error to trigger rollback
        }
      }

      sqlQuery = "";
    }
  }

  if (sqlQuery.trim()) {
    try {
      console.log("Executing final SQL query:", sqlQuery.trim());
      await connection.query(sqlQuery.trim());
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error executing final SQL:", error.message);
        throw error;
      }
    }
  }
}
