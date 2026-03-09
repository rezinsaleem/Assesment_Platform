import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Extended Request type that includes the authenticated user's id and role.
 */
export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

/**
 * Middleware to verify JWT from the Authorization header.
 * Attaches userId and userRole to the request object.
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = header.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET || "fallback_secret";
    const decoded = jwt.verify(token, secret) as { id: string; role: string };
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
