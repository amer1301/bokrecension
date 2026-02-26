import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  console.log("AUTH HEADER:", authHeader);

  if (!authHeader) {
    console.log("NO AUTH HEADER");
    return res.sendStatus(401);
  }

  const token = authHeader.split(" ")[1];

  console.log("TOKEN:", token);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string };

    console.log("DECODED:", decoded);

    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.log("VERIFY ERROR:", err);
    return res.sendStatus(403);
  }
};

export const authenticateOptional = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(); // tillåt request utan token
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string };

    req.userId = decoded.userId;
  } catch {
    // ignorera ogiltig token
  }

  next();
};