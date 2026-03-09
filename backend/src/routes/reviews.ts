import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate, authenticateOptional, AuthRequest } from "../middleware/authMiddleware";
import * as reviewService from "../services/reviewService";
import { createReviewSchema } from "../validation/reviewSchema";
import { z } from "zod";

const router = Router();

const reviewSchema = z.object({
  bookId: z.string(),
  rating: z.number().min(1).max(5),
  content: z.string().min(5).max(2000)
});

/* =========================
   SKAPA RECENSION (Protected)
========================= */

router.post("/", authenticate, async (req: AuthRequest, res, next) => {
  try {

    if (!req.userId) {
      return res.sendStatus(401);
    }

    const result = createReviewSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Ogiltig input",
        details: result.error.issues
      });
    }

    const { bookId, text, rating } = result.data;

    const review = await reviewService.createReview(
      req.userId,
      bookId,
      text,
      rating
    );

    res.status(201).json(review);

  } catch (error) {
    next(error);
  }
});

/* =========================
   HÄMTA RECENSIONER FÖR BOK
========================= */

router.get(
  "/:bookId",
  authenticateOptional,
  async (req: AuthRequest, res, next) => {
    try {
      const bookId = req.params.bookId as string;
      const userId = req.userId ?? null;

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 5;
      const sort = req.query.sort === "asc" ? "asc" : "desc";

      const result = await reviewService.getReviewsByBook(
        bookId,
        userId,
        page,
        limit,
        sort
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/* =========================
   RADERA RECENSION (Protected)
========================= */

router.delete("/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.userId) {
      return res.sendStatus(401);
    }

    const reviewId = req.params.id as string;

const result = await reviewService.deleteReview(
  reviewId,
  req.userId
);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/* =========================
   LIKE RECENSION
========================= */

router.post("/:id/like", authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.userId) return res.sendStatus(401);

    const reviewId = req.params.id as string;

    const result = await reviewService.likeReview(
      reviewId,
      req.userId
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/* =========================
   TA BORT LIKE
========================= */

router.delete("/:id/like", authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.userId) return res.sendStatus(401);

    const reviewId = req.params.id as string;

    const result = await reviewService.unlikeReview(
      reviewId,
      req.userId
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res) => {
  const reviewId = req.params.id;
  const { text, rating } = req.body;

  try {
    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId
      },
      data: {
        text,
        rating
      }
    });

    res.json(updatedReview);

  } catch (error) {
    console.error(error);

    res.status(404).json({
      message: "Review not found"
    });
  }
});
export default router;