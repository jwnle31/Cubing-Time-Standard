import pool from "../db";
import mysql from "mysql2/promise";
import axios from "axios";
import unzipper from "unzipper";
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { TABLE_WHITELIST } from "../globals/appInfo";

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
  let connection: mysql.PoolConnection | null = null;

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

    connection = await pool.getConnection();

    await connection.query("SET SESSION sql_require_primary_key = 0;");
    await connection.query("SET SQL_SAFE_UPDATES = 0;");

    console.log("Starting transaction...");
    await connection.query("START TRANSACTION;");

    // Execute the SQL file line by line
    await executeSqlFile(
      connection,
      path.resolve(__dirname, EXPORT_FOLDER + "WCA_export.sql")
    );

    console.log("Committing transaction...");
    await connection.query("COMMIT;");
    console.log("Database populated successfully.");
  } catch (error: any) {
    console.error("An error occurred:", error.message);
    if (connection) {
      console.log("Rolling back transaction due to error...");
      await connection.query("ROLLBACK;"); // Rollback in case of error
    }
    process.exit(1);
  } finally {
    if (connection) {
      console.log("Closing connection...");
      connection.release();
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

    process.exit(0);
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
  let curTable = "";

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

    if (
      trimmedLine.startsWith("DROP TABLE IF EXISTS") ||
      TABLE_WHITELIST.includes(curTable)
    ) {
      // Append the line to the current SQL query
      sqlQuery += trimmedLine + " ";
    }

    // If the query ends with a semicolon, execute it
    if (sqlQuery.trim().endsWith(";")) {
      if (sqlQuery.trim().startsWith("DROP TABLE IF EXISTS")) {
        if (curTable && TABLE_WHITELIST.includes(curTable)) {
          await executeAdditionalQueries(connection, curTable);
          console.log(`DROP TABLE IF EXISTS \`${curTable}\`;`);
          await connection.query(`DROP TABLE IF EXISTS \`${curTable}\`;`);
          console.log(`RENAME TABLE \`${curTable}_new\` TO \`${curTable}\`;`);
          await connection.query(
            `RENAME TABLE \`${curTable}_new\` TO \`${curTable}\`;`
          );
        }
        const regex = /`([^`]+)`/;
        const match = sqlQuery.match(regex);
        if (match) {
          curTable = match[1];
        }
      } else if (sqlQuery.trim().startsWith("CREATE TABLE")) {
        const regex = /`([^`]+)`/;
        console.log(sqlQuery.replace(regex, `\`${curTable}_new\``));
        await connection.query(sqlQuery.replace(regex, `\`${curTable}_new\``));
      } else if (sqlQuery.trim().startsWith("LOCK TABLES")) {
        console.log(`LOCK TABLES \`${curTable}_new\` WRITE;`);
        await connection.query(`LOCK TABLES \`${curTable}_new\` WRITE;`);
      } else if (sqlQuery.trim().startsWith("INSERT INTO")) {
        const regex = /`([^`]+)`/;
        // console.log("INSERTED :3");
        await connection.query(sqlQuery.replace(regex, `\`${curTable}_new\``));
      } else {
        try {
          await connection.query(sqlQuery.trim());
        } catch (error) {
          if (error instanceof Error) {
            console.error(sqlQuery);
            console.error("Error executing SQL:", error.message);
            throw error;
          }
        }
      }
      // console.log(`Executed query ending at line ${lineNumber}`);

      sqlQuery = "";
    }
  }

  try {
    console.log("Executing final SQL query:", sqlQuery.trim());
    if (curTable && TABLE_WHITELIST.includes(curTable)) {
      await executeAdditionalQueries(connection, curTable);
      console.log(`DROP TABLE IF EXISTS \`${curTable}\`;`);
      await connection.query(`DROP TABLE IF EXISTS \`${curTable}\`;`);
      console.log(`RENAME TABLE \`${curTable}_new\` TO \`${curTable}\`;`);
      await connection.query(
        `RENAME TABLE \`${curTable}_new\` TO \`${curTable}\`;`
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error executing final SQL:", error.message);
      throw error;
    }
  }
}

async function executeAdditionalQueries(
  connection: mysql.Connection,
  curTable: string
) {
  try {
    if (curTable === "RanksSingle") {
      await connection.query(
        `ALTER TABLE ${curTable}_new ADD COLUMN pr DECIMAL(7, 6);`
      );
      await connection.query(`
        UPDATE ${curTable}_new r
        JOIN (
          SELECT 
            personId,
            eventId,
            PERCENT_RANK() OVER (PARTITION BY eventId ORDER BY best ASC) AS calculated_percent_rank
          FROM ${curTable}_new
        ) er ON r.eventId = er.eventId AND r.personId = er.personId
        SET r.pr = er.calculated_percent_rank;
      `);
    } else if (curTable === "RanksAverage") {
      await connection.query(
        `ALTER TABLE ${curTable}_new ADD COLUMN pr FLOAT;`
      );
      await connection.query(`
        UPDATE ${curTable}_new r
        JOIN (
          SELECT 
            personId,
            eventId,
            PERCENT_RANK() OVER (PARTITION BY eventId ORDER BY best ASC) AS calculated_percent_rank
          FROM ${curTable}_new
        ) er ON r.eventId = er.eventId AND r.personId = er.personId
        SET r.pr = er.calculated_percent_rank;
      `);
    } else if (curTable === "Results") {
      await connection.query(
        `CREATE INDEX idx_results_event_person_comp_round ON defaultdb.${curTable}_new (eventId, personId, competitionId, roundTypeId, pos);`
      );
      await connection.query(
        `CREATE INDEX idx_results_comp_event_round_person ON defaultdb.${curTable}_new (competitionId, eventId, roundTypeId, personId);`
      );
      await connection.query(
        `CREATE INDEX idx_personId ON defaultdb.${curTable}_new (personId);`
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `Error executing additional queries for ${curTable}:`,
        error.message
      );
      throw error;
    }
  }
}
