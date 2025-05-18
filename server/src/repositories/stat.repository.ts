import connection from '../db';
import {
  UpdateTime,
  Rank,
  RelativeRecord,
  H2HInfo,
} from '../models/stat.model';

interface IStatRepository {
  getUpdateTime(): Promise<UpdateTime[]>;
  getDistribution(searchParams: {
    eventId: string;
    percents?: number[];
  }): Promise<Rank[]>;
  getRr(searchParams: {
    personId: string;
    type: string;
  }): Promise<RelativeRecord[]>;
  getH2H(searchParams: {
    personId1: string;
    personId2: string;
  }): Promise<H2HInfo[]>;
}

class StatRepository implements IStatRepository {
  async getUpdateTime(): Promise<UpdateTime[]> {
    const query = `
      SELECT 
        UPDATE_TIME 
      FROM 
        information_schema.tables 
      WHERE TABLE_NAME = 'RanksSingle';`;
    try {
      const [rows] = await connection.execute<UpdateTime[]>(query);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  async getDistribution(searchParams: {
    eventId: string;
    percents: number[];
    type: string;
  }): Promise<Rank[]> {
    const tableName =
      searchParams.type === 'single' ? 'RanksSingle' : 'RanksAverage';
    const percents = searchParams.percents
      .map((p) => `WHEN pr <= ${(p * 0.01).toFixed(2)} THEN ${p}`)
      .join('\n');

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
      throw err;
    }
  }

  async getRr(searchParams: {
    personId: string;
    type: string;
  }): Promise<RelativeRecord[]> {
    const tableName =
      searchParams.type === 'single' ? 'RanksSingle' : 'RanksAverage';

    const query = `SELECT eventId, pr FROM ${tableName} WHERE personId = '${searchParams.personId}';`;

    try {
      const [rows] = await connection.execute<RelativeRecord[]>(query);
      return rows.map((entry) => ({
        ...entry,
        pr: Number(entry.pr),
      }));
    } catch (err) {
      throw err;
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
      throw err;
    }
  }
}

export default new StatRepository();
