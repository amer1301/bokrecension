import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

/*
LIKE A REVIEW
*/
router.post("/:reviewId", authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const reviewId = req.params.reviewId as string;

    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    const like = await prisma.reviewLike.create({
      data: {
        userId,
        reviewId
      }
    });

    // skapa notification till review-ägaren
    if (review.userId !== userId) {
      await prisma.notification.create({
        data: {
          type: "LIKE_REVIEW",
          userId: review.userId,
          actorId: userId,
          reviewId: reviewId
        }
      });
    }

    res.json(like);

  } catch (error) {
    console.error(error);
    next(error);
  }
});

/*
UNLIKE A REVIEW
*/
router.delete("/:reviewId", authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const reviewId = req.params.reviewId as string;

    await prisma.reviewLike.delete({
      where: {
        userId_reviewId: {
          userId,
          reviewId
        }
      }
    });

    res.json({ message: "Review unliked" });

  } catch (error) {
    console.error(error);
    next(error);
  }
});

export default router;