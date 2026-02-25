import { Router, Request, Response } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/:userId/stats", async (req: Request, res: Response) => {
  const userId = req.params.userId as string;

  try {
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: { likes: true },
    });

    const totalReviews = reviews.length;

    const avgRating =
      totalReviews > 0
        ? reviews.reduce(
            (sum: number, r) => sum + r.rating,
            0
          ) / totalReviews
        : 0;

    const totalLikes = reviews.reduce(
  (sum: number, r: { likes: any[] }) =>
    sum + r.likes.length,
  0
);

    res.json({
      totalReviews,
      avgRating,
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