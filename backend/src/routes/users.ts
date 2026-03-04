import { Router, Request, Response } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/:userId/stats", async (req: Request, res: Response) => {
  const userId = req.params.userId as string;

  try {

    // kontrollera att användaren finns
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // hämta recensioner + likes
    const reviews = await prisma.review.findMany({
      where: { userId: userId },
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

export default router;