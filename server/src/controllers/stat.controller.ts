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
      });
    }
  }

  async getPr(req: Request, res: Response) {
    try {
      const { personId, type } = req.params;
      if (type !== "single" && type !== "average") {
        res.status(400).json({
          message: "Type has to be single or average.",
        });
        return;
      }
      const pr = await statRepository.getPr({ personId, type });
      res.status(200).send(pr);
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!",
      });
    }
  }
}
