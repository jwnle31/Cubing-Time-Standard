import connection from "../db";
import { ArInternalMetadata, Rank } from "../models/stat.model";

interface IStatRepository {
  getMetadata(): Promise<ArInternalMetadata[]>;
  getPercentiles(searchParams: {
    eventId: string;
    percentiles?: number[];
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

  getPercentiles(searchParams: {
    eventId: string;
    percentiles: number[];
    type: string;
  }): Promise<Rank[]> {
    const tableName =
      searchParams.type === "single" ? "RanksSingle" : "RanksAverage";

    const whereClause = searchParams.percentiles
      .map((p) => `ROUND(0.01 * ${p} * @row_num)`)
      .join(", ");

    const query = `
      SELECT *
      FROM (
          SELECT t.*, 
                @row_num := @row_num + 1 AS row_num
          FROM ${tableName} t, 
              (SELECT @row_num := 0) counter
          WHERE t.eventId = ?
      ) AS temp
      WHERE temp.row_num IN (${whereClause})
      ORDER BY temp.row_num;
    `;

    const queryParams = [searchParams.eventId];

    return new Promise((resolve, reject) => {
      connection.query<Rank[]>(query, queryParams, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  }
}

export default new StatRepository();
