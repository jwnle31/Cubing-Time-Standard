import { Request, Response } from "express";
import statRepository from "../repositories/stat.repository";

export default class StatsController {
  async getMetadata(req: Request, res: Response) {
    try {
      const metadata = await statRepository.getMetadata();
      res.status(200).send(metadata);
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!",
      });
    }
  }

  async getPercentiles(req: Request, res: Response) {
    try {
      const { eventId, type } = req.params;
      if (type !== "single" && type !== "average") {
        res.status(400).json({
          message: "Type has to be single or average.",
        });
        return;
      }

      const percList = req.query.perc
        ? (req.query.perc as string).split(",").map(Number) // Parse percentiles from query
        : Array.from({ length: 100 }, (_, i) => i + 1);

      const percentiles = await statRepository.getPercentiles({
        eventId,
        percentiles: percList,
        type,
      });
      res.status(200).send(percentiles);
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!",
      });
    }
  }
}
