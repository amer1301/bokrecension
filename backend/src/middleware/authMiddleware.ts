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

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const token = authHeader.split(" ")[1];

  try {
    console.log("VERIFY SECRET:", process.env.JWT_SECRET);
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