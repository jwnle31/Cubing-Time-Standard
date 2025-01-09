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
