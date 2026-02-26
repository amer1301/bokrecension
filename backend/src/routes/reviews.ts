import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/authMiddleware";
import * as reviewService from "../services/reviewService";
import { createReviewSchema } from "../validation/reviewSchema";

const router = Router();

/* =========================
   SKAPA RECENSION (Protected)
========================= */

router.post("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.userId) {
      return res.sendStatus(401);
    }

    const validated = createReviewSchema.parse(req.body);

    const review = await reviewService.createReview(
      req.userId,
      validated.bookId,
      validated.text,
      validated.rating
    );

    res.status(201).json(review);

  } catch (error) {
    next(error);
  }
});

/* =========================
   HÄMTA RECENSIONER FÖR BOK
========================= */

router.get("/:bookId", async (req: AuthRequest, res, next) => {
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
});

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
   LIKE RECENSION (Protected)
========================= */

router.post("/:id/like", authenticate, async (req: AuthRequest, res, next) => {
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
   TA BORT LIKE (Protected)
========================= */

router.delete("/:id/like", authenticate, async (req: AuthRequest, res, next) => {
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

export default router;