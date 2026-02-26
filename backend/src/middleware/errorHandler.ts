import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("ERROR:", err);

  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: err.issues.map((issue) => issue.message),
    });
  }

  // Custom thrown error with status
  if (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "message" in err
  ) {
    const typedErr = err as { status: number; message: string };

    return res.status(typedErr.status).json({
      error: typedErr.message,
    });
  }

  // Fallback
  return res.status(500).json({
    error: "Internal server error",
  });
};