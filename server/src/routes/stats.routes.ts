import { Router } from "express";
import StatController from "../controllers/stat.controller";
import cacheMiddleware from "../middlewares/cacheMiddleware";

class StatRoutes {
  router = Router();
  controller = new StatController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get("/metadata/", cacheMiddleware, this.controller.getMetadata);
    this.router.get(
      "/distribution/:eventId/:type/",
      cacheMiddleware,
      this.controller.getDistribution
    );
  }
}

export default new StatRoutes().router;
