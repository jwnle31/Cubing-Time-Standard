import connection from "../db";
import { ArInternalMetadata, Rank } from "../models/stat.model";

interface IStatRepository {
  getMetadata(): Promise<ArInternalMetadata[]>;
  getDistribution(searchParams: {
    eventId: string;
    percents?: number[];
  }): Promise<Rank[]>;
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
}

export default new StatRepository();
