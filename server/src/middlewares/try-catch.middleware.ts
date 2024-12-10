import { Request, Response, NextFunction } from "express";
import { ApiError } from "../lib/api-error";

export const tryCatch = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((e: ApiError | Error) => {
      next(e);
    });
  };
};
