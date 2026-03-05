import { Router, Request, Response } from "express";
import { prisma } from "../prisma";

const router = Router();

/* =========================
   GET USER
========================= */

router.get("/:userId", async (req: Request, res: Response) => {
  const userId = req.params.userId as string;

  try {

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Could not fetch user",
    });

  }
});


/* =========================
   USER STATS
========================= */

router.get("/:userId/stats", async (req: Request, res: Response) => {

  const userId = req.params.userId as string;

  try {

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
        followingId,
      },
    });

    res.json({
      message: "User followed",
    });

  } catch (error) {

    res.status(400).json({
      message: "Already following",
    });

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
          followingId,
        },
      },
    });

    res.json({
      message: "User unfollowed",
    });

  } catch (error) {

    res.status(400).json({
      message: "Follow relationship not found",
    });

  }

});


/* =========================
   CHECK FOLLOW STATUS
========================= */

router.get(
  "/:userId/follow-status/:followerId",
  async (req: Request, res: Response) => {

    const userId = req.params.userId as string;
    const followerId = req.params.followerId as string;

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId,
        },
      },
    });

    res.json({
      isFollowing: !!follow,
    });

  }
);


/* =========================
   UPDATE PROFILE
========================= */

router.patch("/:userId", async (req: Request, res: Response) => {

  const userId = req.params.userId as string;
  const { username, avatarUrl } = req.body;

  try {

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        avatarUrl,
      },
    });

    res.json(updatedUser);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Kunde inte uppdatera användare",
    });

  }

});


/* =========================
   FOLLOWERS / FOLLOWING
========================= */

router.get("/:userId/follows", async (req: Request, res: Response) => {

  const userId = req.params.userId as string;

  try {

    const followers = await prisma.follow.findMany({
      where: {
        followingId: userId,
      },
      select: {
        follower: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    const following = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        following: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json({
      followers: followers.map((f) => f.follower),
      following: following.map((f) => f.following),
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Could not fetch follow data",
    });

  }

});

export default router;