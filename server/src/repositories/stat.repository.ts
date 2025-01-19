import connection from "../db";
import { ArInternalMetadata, Rank, PersonalRecord } from "../models/stat.model";

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
}

export default new StatRepository();
