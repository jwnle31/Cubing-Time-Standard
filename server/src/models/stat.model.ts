import { RowDataPacket } from "mysql2";

export interface ArInternalMetadata extends RowDataPacket {
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface Rank extends RowDataPacket {
  top: number;
  best: number;
}

export interface PersonalRecord extends RowDataPacket {
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
