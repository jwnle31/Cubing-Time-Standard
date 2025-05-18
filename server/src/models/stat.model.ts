import { RowDataPacket } from 'mysql2';

export interface UpdateTime extends RowDataPacket {
  UPDATE_TIME: string;
}

export interface Rank extends RowDataPacket {
  top: number;
  best: number;
}

export interface RelativeRecord extends RowDataPacket {
  eventId: string;
  pr: number;
}

export interface H2HInfo extends RowDataPacket {
  competitionId: string;
  eventId: string;
  roundTypeId: string;
  pos1: number;
  pos2: number;
  winner: number;
}
