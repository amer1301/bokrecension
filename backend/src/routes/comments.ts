import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate } from "../middleware/authMiddleware";
import { z } from "zod";

const router = Router();

const commentSchema = z.object({
  text: z.string().min(1).max(500)
});

router.post("/:reviewId", authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const reviewId = req.params.reviewId as string;

    const result = commentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Ogiltig input",
        details: result.error.issues
      });
    }

    const { text } = result.data;

    // hämta recension
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // skapa kommentar
    const comment = await prisma.comment.create({
      data: {
        text,
        reviewId,
        userId
      },
      include: {
        user: true
      }
    });

    /* =========================
       CREATE NOTIFICATION
    ========================= */

    if (review.userId !== userId) {
      await prisma.notification.create({
        data: {
          type: "COMMENT_REVIEW",
          userId: review.userId,
          actorId: userId,
          reviewId: reviewId
        }
      });
    }

    res.status(201).json(comment);

  } catch (error) {
    console.error(error);
    next(error);
  }
});

/* =========================
GET COMMENTS FOR A REVIEW
========================= */
router.get("/:reviewId", async (req, res, next) => {
  try {

    const reviewId = req.params.reviewId as string;

    const comments = await prisma.comment.findMany({
      where: { reviewId },
      include: {
        user: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(comments);

  } catch (error) {
    console.error(error);
    next(error);
  }
});

/* =========================
DELETE COMMENT
========================= */
router.delete("/:id", authenticate, async (req, res, next) => {
  try {

    const commentId = req.params.id as string;
    const userId = (req as any).userId as string;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    res.json({ message: "Comment deleted" });

  } catch (error) {
    console.error(error);
    next(error);
  }
});
export default router;