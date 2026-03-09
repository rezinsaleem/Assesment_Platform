import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

/**
 * Factory function that returns middleware restricting access to specific roles.
 * Must be used after authMiddleware so that req.userRole is available.
 */
export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    next();
  };
};
