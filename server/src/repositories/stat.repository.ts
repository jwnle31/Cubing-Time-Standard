import connection from "../db";
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
  getMetadata(): Promise<ArInternalMetadata[]> {
    const query = `
      SELECT * 
      FROM ar_internal_metadata;
    `;
    return new Promise((resolve, reject) => {
      connection.query<ArInternalMetadata[]>(query, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  }

  getDistribution(searchParams: {
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

    return new Promise((resolve, reject) => {
      connection.query<Rank[]>(query, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  }

  getPr(searchParams: {
    personId: string;
    type: string;
  }): Promise<PersonalRecord[]> {
    const tableName =
      searchParams.type === "single" ? "RanksSingle" : "RanksAverage";

    const query = `SELECT eventId, pr FROM ${tableName} WHERE personId = '${searchParams.personId}';`;

    return new Promise((resolve, reject) => {
      connection.query<PersonalRecord[]>(query, (err, res) => {
        if (err) reject(err);
        else
          resolve(
            res.map((entry) => ({
              ...entry,
              pr: Number(entry.pr),
            }))
          );
      });
    });
  }

  getH2H(searchParams: {
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

    return new Promise((resolve, reject) => {
      connection.query<H2HInfo[]>(query, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  }
}

export default new StatRepository();
