import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";
import { ApiError } from "../lib/api-error";

export const errorHandlerMiddleware = (
  error: ApiError | Error | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(error.message);
  const status = error?.status || 500;
  const message = error?.message || "Something went wrong!";
  const name = error?.name || "ERROR";
  return next(
    res.status(status).json({
      status,
      message,
      name,
    })
  );
};
