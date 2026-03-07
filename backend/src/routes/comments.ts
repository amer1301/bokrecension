import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

/*
CREATE COMMENT
*/
router.post("/:reviewId", authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = (req as any).userId;
    const reviewId = req.params.reviewId as string;

    if (!text) {
      return res.status(400).json({ error: "Comment text required" });
    }

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

    res.json(comment);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create comment" });
  }
});

/*
GET COMMENTS FOR A REVIEW
*/
router.get("/:reviewId", async (req, res) => {
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
    res.status(500).json({ error: "Could not fetch comments" });
  }
});

export default router;