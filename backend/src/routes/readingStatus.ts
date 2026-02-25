import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

/* =========================
   HÄMTA STATUS FÖR BOK
========================= */

router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const statuses = await prisma.readingStatus.findMany({
      where: {
        userId: req.userId!,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.json(statuses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Kunde inte hämta statusar" });
  }
});

router.get("/:bookId", authenticate, async (req: AuthRequest, res) => {
    const bookId = req.params.bookId as string;

    const status = await prisma.readingStatus.findUnique({
        where: {
            bookId_userId: {
                bookId,
                userId: req.userId!,
            },
        },
    });

    res.json(status);
});

/* =========================
   SKAPA / UPPDATERA STATUS
========================= */
router.post("/", authenticate, async (req: AuthRequest, res) => {
    const { bookId, status, format, pagesRead } = req.body;

    const result = await prisma.readingStatus.upsert({
        where: {
  bookId_userId: {
                bookId,
                userId: req.userId!,
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
            userId: req.userId!,
        },
    });

    res.json(result);
});

/* =========================
   HÄMTA ALLA STATUS FÖR USER
========================= */
router.get("/", authenticate, async (req: AuthRequest, res) => {
  const statuses = await prisma.readingStatus.findMany({
    where: {
      userId: req.userId!,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  res.json(statuses);
});

export default router;