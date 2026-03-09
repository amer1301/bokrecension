import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

/*
GET ACTIVITY FEED
*/
router.get("/", authenticate, async (req, res, next) => {
  try {
    const userId = (req as any).userId;

    // hämta vilka användare man följer
    const follows = await prisma.follow.findMany({
      where: { followerId: userId }
    });

    const followingIds = follows.map((f) => f.followingId);

    // hämta reviews från dessa användare
    const reviews = await prisma.review.findMany({
      where: {
        userId: {
          in: followingIds
        }
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 20
    });

    res.json(reviews);

  } catch (error) {
    console.error(error);
    next(error);
  }
});

export default router;