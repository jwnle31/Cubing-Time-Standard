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
        err,
      });
    }
  }

  async getDistribution(req: Request, res: Response) {
    try {
      const { eventId, type } = req.params;
      if (type !== "single" && type !== "average") {
        res.status(400).json({
          message: "Type has to be single or average.",
        });
        return;
      }

      const percList = req.query.perc
        ? (req.query.perc as string).split(",").map(Number)
        : Array.from({ length: 100 }, (_, i) => i + 1);

      const distribution = await statRepository.getDistribution({
        eventId,
        percents: percList,
        type,
      });
      res.status(200).send(distribution);
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!",
        err,
      });
    }
  }

  async getRr(req: Request, res: Response) {
    try {
      const { personId, type } = req.params;
      if (type !== "single" && type !== "average") {
        res.status(400).json({
          message: "Type has to be single or average.",
        });
        return;
      }
      const rr = await statRepository.getRr({ personId, type });
      res.status(200).send(rr);
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!",
        err,
      });
    }
  }

  async getH2H(req: Request, res: Response) {
    try {
      const { personId1, personId2 } = req.params;
      const h2h = await statRepository.getH2H({ personId1, personId2 });
      res.status(200).send(h2h);
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!",
        err,
      });
    }
  }
}
