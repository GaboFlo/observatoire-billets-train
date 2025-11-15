import { Request, Response, NextFunction } from "express";

const MAX_REQ_SIZE = 1024 * 100;

export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
};

export const validateContentType = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.method === "POST" || req.method === "PUT") {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("application/json")) {
      res.status(400).json({ error: "Content-Type must be application/json" });
      return;
    }
  }
  next();
};

export const limitPayloadSize = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const contentLength = req.headers["content-length"];
  if (contentLength && parseInt(contentLength, 10) > MAX_REQ_SIZE) {
    res.status(413).json({ error: "Payload too large" });
    return;
  }
  next();
};

export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const sanitizeString = (str: string): string => {
    return str
      .replace(/[<>]/g, "")
      .trim()
      .substring(0, 200);
  };

  const sanitizeArray = (arr: unknown[]): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((item): item is string => typeof item === "string")
      .map(sanitizeString)
      .slice(0, 50);
  };

  if (req.body) {
    if (req.body.carriers) {
      req.body.carriers = sanitizeArray(req.body.carriers);
    }
    if (req.body.classes) {
      req.body.classes = sanitizeArray(req.body.classes);
    }
    if (req.body.discountCards) {
      req.body.discountCards = sanitizeArray(req.body.discountCards);
    }
    if (req.body.flexibilities) {
      req.body.flexibilities = sanitizeArray(req.body.flexibilities);
    }
    if (req.body.selectedDates) {
      req.body.selectedDates = sanitizeArray(req.body.selectedDates);
    }
    if (typeof req.body.departureStationId === "number") {
      req.body.departureStationId = Math.abs(
        Math.floor(req.body.departureStationId)
      );
    }
    if (typeof req.body.arrivalStationId === "number") {
      req.body.arrivalStationId = Math.abs(
        Math.floor(req.body.arrivalStationId)
      );
    }
    if (typeof req.body.trainNumber === "number") {
      req.body.trainNumber = Math.abs(Math.floor(req.body.trainNumber));
    }
    if (typeof req.body.date === "string") {
      req.body.date = sanitizeString(req.body.date);
    }
    if (typeof req.body.selectedDate === "string") {
      req.body.selectedDate = sanitizeString(req.body.selectedDate);
    }
  }

  if (req.params) {
    Object.keys(req.params).forEach((key) => {
      if (typeof req.params[key] === "string") {
        req.params[key] = sanitizeString(req.params[key]);
      }
    });
  }

  next();
};

