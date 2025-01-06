import { Request, Response } from "express";

export function welcome(req: Request, res: Response): any {
  return res.json({ message: "Welcome to my application!" });
}
