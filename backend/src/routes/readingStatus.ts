import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

/* =========================
   HÄMTA ALLA STATUS FÖR USER
========================= */
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.sendStatus(401);

    const statuses = await prisma.readingStatus.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: "desc" },
    });

    res.json(statuses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Kunde inte hämta statusar" });
  }
});

/* =========================
   HÄMTA STATUS FÖR SPECIFIK BOK
========================= */
router.get("/:bookId", authenticate, async (
  req: AuthRequest & { params: { bookId: string } },
  res
) => {
  try {
    if (!req.userId) return res.sendStatus(401);

    const bookId = req.params.bookId;

    const status = await prisma.readingStatus.findUnique({
      where: {
        bookId_userId: {
          bookId,
          userId: req.userId,
        },
      },
    });

    res.json(status);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Kunde inte hämta status" });
  }
});

/* =========================
   SKAPA / UPPDATERA STATUS
========================= */
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.sendStatus(401);

    const { bookId, status, format, pagesRead } = req.body;

    const result = await prisma.readingStatus.upsert({
      where: {
        bookId_userId: {
          bookId,
          userId: req.userId,
        },
      },
      update: {
        status,
        format,
        pagesRead,
      },
      create: {
        bookId,
        status,
        format,
        pagesRead,
        userId: req.userId,
      },
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Kunde inte uppdatera status" });
  }
});

export default router;