import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate, AuthRequest } from "../middleware/authMiddleware";
import { z } from "zod";

const router = Router();

/* =========================
   ZOD SCHEMA
========================= */

const readingStatusSchema = z.object({
  bookId: z.string(),
  status: z.enum(["PLANNED", "READING", "COMPLETED", "DROPPED"]),
  format: z.enum(["PHYSICAL", "EBOOK", "AUDIOBOOK"]).optional(),
  pagesRead: z.coerce.number().min(0).optional()
});

/* =========================
   HÄMTA ALLA STATUS FÖR USER
========================= */

router.get("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.userId) return res.sendStatus(401);

    const statuses = await prisma.readingStatus.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: "desc" }
    });

    res.json(statuses);

  } catch (error) {
    console.error(error);
    next(error);
  }
});

/* =========================
   HÄMTA STATUS FÖR SPECIFIK BOK
========================= */

router.get(
  "/:bookId",
  authenticate,
  async (req: AuthRequest & { params: { bookId: string } }, res, next) => {
    try {
      if (!req.userId) return res.sendStatus(401);

      const bookId = req.params.bookId;

      const status = await prisma.readingStatus.findUnique({
        where: {
          bookId_userId: {
            bookId,
            userId: req.userId
          }
        }
      });

      res.json(status);

    } catch (error) {
      next(error);
    }
  }
);

/* =========================
   SKAPA / UPPDATERA STATUS
========================= */

router.post("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.userId) return res.sendStatus(401);

    const result = readingStatusSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Ogiltig input",
        details: result.error.issues
      });
    }

    const { bookId, status, format, pagesRead } = result.data;

    const readingStatus = await prisma.readingStatus.upsert({
      where: {
        bookId_userId: {
          bookId,
          userId: req.userId
        }
      },
      update: {
        status,
        format,
        pagesRead
      },
      create: {
        bookId,
        status,
        format,
        pagesRead,
        userId: req.userId
      }
    });

    res.json(readingStatus);

  } catch (error) {
    next(error);
  }
});

export default router;