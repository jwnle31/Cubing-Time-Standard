import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import rateLimit from "express-rate-limit";
import Routes from "./routes";
import cron from "node-cron";
import { populateDatabase } from "./scripts/populate";
import { callEndpointsAndCache } from "./scripts/updateCache";

export default class Server {
  private isCronRunning = false;

  constructor(app: Application) {
    this.config(app);
    new Routes(app);
  }

  private config(app: Application): void {
    app.use(
      rateLimit({
        max: 1000,
        windowMs: 24 * 60 * 60 * 1000,
        message: "Too many request from this IP",
      })
    );
    app.use((req, res, next) => {
      if (this.isCronRunning) {
        res.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
      } else {
        res.set("Cache-Control", "public, max-age=86400"); // Cache for 1 day
      }
      next();
    });
    const corsOptions: CorsOptions = {
      origin: process.env.origin,
    };
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    this.initializeCronJobs();
  }

  private initializeCronJobs(): void {
    cron.schedule("0 0 * * 5", async () => {
      try {
        console.log("Cron job started.");
        this.isCronRunning = true;

        await populateDatabase();
        await callEndpointsAndCache();

        console.log("Cron job completed.");
      } catch (error) {
        console.error("Error during cron job:", error);
      } finally {
        this.isCronRunning = false;
      }
    });

    console.log("Cron job initialized.");
  }
}
