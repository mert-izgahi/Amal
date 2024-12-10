import { Request, Response } from "express";
import { ApiError } from "../lib/api-error";

export const notFoundMiddleware = (req: Request, res: Response) => {
  const error = ApiError.notFound("Not Found");
  res.status(error.status).json({
    message: error.message,
    status: "fail",
    error,
  });
};
