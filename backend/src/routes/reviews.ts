import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate, AuthRequest } from "../middleware/authMiddleware";


const router = Router();

/* =========================
   SKAPA RECENSION (Protected)
========================= */

router.post("/", authenticate, async (req: AuthRequest, res) => {
    const { bookId, text, rating } = req.body;

    if (!req.userId) return res.sendStatus(401);

    const review = await prisma.review.create({
        data: {
            bookId,
            text,
            rating,
            userId: req.userId,
        },
    });

    res.json(review);
});

/* =========================
   HÄMTA RECENSIONER FÖR BOK
========================= */

router.get("/:bookId", async (req: AuthRequest, res) => {
  const bookId = req.params.bookId as string;

  const reviews = await prisma.review.findMany({
    where: { bookId },
    include: {
      user: true,
      likes: true,
    },
  });

  const userId = req.userId ?? null;

  const formatted = reviews.map((review) => ({
    ...review,
    likesCount: review.likes.length,
    isLikedByUser: userId
      ? review.likes.some((like) => like.userId === userId)
      : false,
  }));

  res.json(formatted);
});

/* =========================
   RADERA RECENSION (Protected)
========================= */

router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
    const id = req.params.id as string;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) return res.sendStatus(404);
    if (review.userId !== req.userId) return res.sendStatus(403);

    await prisma.review.delete({ where: { id }});

    res.json({ message: "Recension borttagen" });
});

export default router;