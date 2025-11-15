import { NextFunction, Request, Response } from "express";

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
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
};

export const validateContentType = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.method === "POST" || req.method === "PUT") {
    const contentType = req.headers["content-type"];
    if (!contentType?.includes("application/json")) {
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

const sanitizeString = (str: string): string => {
  return str.replace(/[<>]/g, "").trim().substring(0, 200);
};

const sanitizeArray = (arr: unknown[]): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((item): item is string => typeof item === "string")
    .map(sanitizeString)
    .slice(0, 50);
};

const sanitizeNumber = (value: number): number => {
  return Math.abs(Math.floor(value));
};

const sanitizeBody = (body: Record<string, unknown>): void => {
  const arrayFields = [
    "carriers",
    "classes",
    "discountCards",
    "flexibilities",
    "selectedDates",
  ];

  arrayFields.forEach((field) => {
    if (body[field]) {
      body[field] = sanitizeArray(body[field] as unknown[]);
    }
  });

  const numberFields = [
    "departureStationId",
    "arrivalStationId",
    "trainNumber",
  ];

  numberFields.forEach((field) => {
    const value = body[field];
    if (typeof value === "number") {
      body[field] = sanitizeNumber(value);
    }
  });

  const stringFields = ["date", "selectedDate"];

  stringFields.forEach((field) => {
    const value = body[field];
    if (typeof value === "string") {
      body[field] = sanitizeString(value);
    }
  });
};

const sanitizeParams = (params: Record<string, string>): void => {
  Object.keys(params).forEach((key) => {
    if (typeof params[key] === "string") {
      params[key] = sanitizeString(params[key]);
    }
  });
};

export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.body) {
    sanitizeBody(req.body);
  }

  if (req.params) {
    sanitizeParams(req.params);
  }

  next();
};
