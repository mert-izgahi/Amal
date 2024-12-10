import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../lib/api-error";
import { RoleTypes } from "../lib/enums";
import config from "../config";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req?.cookies?.accessToken;

  if (!accessToken) {
    return next();
  }

  const decoded = jwt.verify(
    accessToken,
    config.JWT_ACCESS_SECRET!,
    (err: any, decoded: any) => {
      if (err) {
        return next();
      }
      if (!decoded) {
        return next();
      }
      return decoded;
    }
  );

  const currentUserId = (decoded as any)._id;
  const currentUserRole = (decoded as any).role;
  if (!currentUserId) {
    return next();
  }

  if (!currentUserRole) {
    return next();
  }

  res.locals.userId = currentUserId;
  res.locals.role = currentUserRole;

  return next();
};

export const withAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.userId) {
    throw ApiError.unauthenticated("Unauthenticated");
  }
  next();
};

export const authorizedFor = (...roles: RoleTypes[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.userId) {
      return next();
    }

    if (!roles.includes(res.locals.role.name)) {
      return next();
    }
    next();
  };
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  const role = res.locals.role;

  if (!role) {
    return next(ApiError.unauthorized("Unauthorized"));
  }

  if (role !== RoleTypes.ADMIN) {
    return next(ApiError.unauthorized("Unauthorized"));
  }
  next();
};
