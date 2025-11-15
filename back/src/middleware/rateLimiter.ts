import { NextFunction, Request, Response } from "express";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW = 1 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 100;
const RATE_LIMIT_STRICT_MAX_REQUESTS = 50;

const getClientIdentifier = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : req.socket.remoteAddress || "unknown";
  return ip;
};

const cleanupExpiredEntries = (): void => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetTime < now) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => {
    rateLimitStore.delete(key);
  });
};

setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

export const rateLimiter = (maxRequests: number = RATE_LIMIT_MAX_REQUESTS) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = getClientIdentifier(req);
    const now = Date.now();

    let entry = rateLimitStore.get(clientId);

    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + RATE_LIMIT_WINDOW,
      };
      rateLimitStore.set(clientId, entry);
    }

    entry.count += 1;

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader("X-RateLimit-Limit", String(maxRequests));
      res.setHeader("X-RateLimit-Remaining", String(0));
      res.setHeader(
        "X-RateLimit-Reset",
        String(Math.ceil(entry.resetTime / 1000))
      );
      res.status(429).json({
        error: "Too many requests",
        retryAfter,
      });
      return;
    }

    res.setHeader("X-RateLimit-Limit", String(maxRequests));
    res.setHeader("X-RateLimit-Remaining", String(maxRequests - entry.count));
    res.setHeader(
      "X-RateLimit-Reset",
      String(Math.ceil(entry.resetTime / 1000))
    );

    next();
  };
};

export const strictRateLimiter = rateLimiter(RATE_LIMIT_STRICT_MAX_REQUESTS);
