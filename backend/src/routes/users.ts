import { Router, Request, Response } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/:userId/stats", async (req: Request, res: Response) => {
  const userId = req.params.userId as string;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        likes: true,
      },
    });

    const totalReviews = reviews.length;

    const avgRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews
        : 0;

    const totalLikes = reviews.reduce(
      (sum, review) => sum + review.likes.length,
      0
    );

    res.json({
      userId,
      totalReviews,
      avgRating: Number(avgRating.toFixed(2)),
      totalLikes,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Kunde inte hämta statistik",
    });
  }
});


/* =========================
   FOLLOW USER
========================= */

router.post("/:userId/follow", async (req: Request, res: Response) => {
  const followerId = req.body.followerId as string;
  const followingId = req.params.userId as string;

  try {

    await prisma.follow.create({
      data: {
        followerId,
        followingId
      }
    });

    res.json({ message: "User followed" });

  } catch (error) {
    res.status(400).json({ message: "Already following" });
  }
});


/* =========================
   UNFOLLOW USER
========================= */

router.delete("/:userId/follow", async (req: Request, res: Response) => {

  const followerId = req.body.followerId as string;
  const followingId = req.params.userId as string;

  try {

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    res.json({ message: "User unfollowed" });

  } catch (error) {

    res.status(400).json({
      message: "Follow relationship not found"
    });

  }

});


/* =========================
   CHECK FOLLOW STATUS
========================= */

router.get("/:userId/follow-status/:followerId", async (req: Request, res: Response) => {

  const userId = req.params.userId as string;
  const followerId = req.params.followerId as string;

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: userId
      }
    }
  });

  res.json({
    isFollowing: !!follow
  });

});

export default router;