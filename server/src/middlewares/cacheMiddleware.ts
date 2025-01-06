import { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";

// Initialize cache with a 7-day TTL
export const cache = new NodeCache({ stdTTL: 604800 });

export default function cacheMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.headers["x-internal-request"]) {
    return next();
  }

  const key = req.originalUrl;
  const cachedData = cache.get(key);

  if (cachedData) {
    console.log(`Cache hit for key: ${key}`);
    res.send(cachedData);
    return;
  }

  const originalSend = res.send;
  res.send = function (body: any): Response {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(key, body);
    }

    return originalSend.call(res, body);
  };

  next();
}

export function clearCache(): void {
  cache.flushAll();
  console.log("Server-side cache cleared.");
}
