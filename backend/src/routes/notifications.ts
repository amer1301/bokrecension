import { Router } from "express";
import { prisma } from "../prisma";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

/*
GET USER NOTIFICATIONS
*/
router.get("/", authenticate, async (req, res) => {

  try {

    const userId = (req as any).userId;

    const notifications = await prisma.notification.findMany({

      where: {
        userId
      },

      include: {

        actor: {
          select: {
            id: true,
            username: true
          }
        },

        review: {
          select: {
            id: true,
            bookId: true
          }
        }

      },

      orderBy: {
        createdAt: "desc"
      }

    });

    res.json(notifications);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Could not fetch notifications"
    });

  }

});

export default router;