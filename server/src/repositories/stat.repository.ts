import connection from "../db"; // Import the pool
import {
  ArInternalMetadata,
  Rank,
  PersonalRecord,
  H2HInfo,
} from "../models/stat.model";

interface IStatRepository {
  getMetadata(): Promise<ArInternalMetadata[]>;
  getDistribution(searchParams: {
    eventId: string;
    percents?: number[];
  }): Promise<Rank[]>;
  getPr(searchParams: {
    personId: string;
    type: string;
  }): Promise<PersonalRecord[]>;
  getH2H(searchParams: {
    personId1: string;
    personId2: string;
  }): Promise<H2HInfo[]>;
}

class StatRepository implements IStatRepository {
  async getMetadata(): Promise<ArInternalMetadata[]> {
    const query = `SELECT * FROM ar_internal_metadata;`;
    try {
      const [rows] = await connection.execute<ArInternalMetadata[]>(query);
      return rows;
    } catch (err) {
      throw err; // Handle error accordingly
    }
  }

  async getDistribution(searchParams: {
    eventId: string;
    percents: number[];
    type: string;
  }): Promise<Rank[]> {
    const tableName =
      searchParams.type === "single" ? "RanksSingle" : "RanksAverage";
    const percents = searchParams.percents
      .map((p) => `WHEN pr <= ${(p * 0.01).toFixed(2)} THEN ${p}`)
      .join("\n");

    const query = `
      SELECT
        CASE
          ${percents}
        END AS top,
        MAX(best) AS best
      FROM ${tableName}
      WHERE eventId = '${searchParams.eventId}' AND pr <= ${(
      Math.max(...searchParams.percents) * 0.01
    ).toFixed(2)}
      GROUP BY top
      ORDER BY top;
    `;

    try {
      const [rows] = await connection.execute<Rank[]>(query);
      return rows;
    } catch (err) {
      throw err; // Handle error accordingly
    }
  }

  async getPr(searchParams: {
    personId: string;
    type: string;
  }): Promise<PersonalRecord[]> {
    const tableName =
      searchParams.type === "single" ? "RanksSingle" : "RanksAverage";

    const query = `SELECT eventId, pr FROM ${tableName} WHERE personId = '${searchParams.personId}';`;

    try {
      const [rows] = await connection.execute<PersonalRecord[]>(query);
      return rows.map((entry) => ({
        ...entry,
        pr: Number(entry.pr),
      }));
    } catch (err) {
      throw err; // Handle error accordingly
    }
  }

  async getH2H(searchParams: {
    personId1: string;
    personId2: string;
  }): Promise<H2HInfo[]> {
    const query = `
      SELECT 
        r1.competitionId,
        r1.eventId,
        r1.roundTypeId,
        r1.pos AS pos1,
        r2.pos AS pos2,
        CASE
            WHEN r1.pos < r2.pos THEN 1
            WHEN r2.pos < r1.pos THEN 2
            ELSE 0
        END AS winner
      FROM (SELECT * FROM Results WHERE personId = '${searchParams.personId1}') r1
      JOIN (SELECT * FROM Results WHERE personId = '${searchParams.personId2}') r2
          ON r1.competitionId = r2.competitionId
          AND r1.eventId = r2.eventId
          AND r1.roundTypeId = r2.roundTypeId;
    `;

    try {
      const [rows] = await connection.execute<H2HInfo[]>(query);
      return rows;
    } catch (err) {
      throw err; // Handle error accordingly
    }
  }
}

export default new StatRepository();
