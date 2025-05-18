import { Router } from 'express';
import StatController from '../controllers/stat.controller';
import cacheMiddleware from '../middlewares/cacheMiddleware';

class StatRoutes {
  router = Router();
  controller = new StatController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      '/updatetime/',
      cacheMiddleware,
      this.controller.getUpdateTime
    );
    this.router.get(
      '/distribution/:eventId/:type/',
      cacheMiddleware,
      this.controller.getDistribution
    );
    this.router.get(
      '/pr/:personId/:type/',
      cacheMiddleware,
      this.controller.getRr
    );
    this.router.get(
      '/h2h/:personId1/:personId2/',
      cacheMiddleware,
      this.controller.getH2H
    );
  }
}

export default new StatRoutes().router;
