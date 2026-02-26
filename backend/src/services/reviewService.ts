import { prisma } from "../prisma";

/* =========================
   SKAPA RECENSION
========================= */

export const createReview = async (
  userId: string,
  bookId: string,
  text: string,
  rating: number
) => {
  if (!bookId || !text || rating == null) {
    throw { status: 400, message: "Ogiltig data" };
  }

  if (rating < 1 || rating > 5) {
    throw { status: 400, message: "Betyg måste vara mellan 1 och 5" };
  }

  return await prisma.review.create({
    data: {
      bookId,
      text,
      rating,
      userId,
    },
  });
};

/* =========================
   HÄMTA RECENSIONER FÖR BOK
========================= */

export const getReviewsByBook = async (
  bookId: string,
  userId: string | null,
  page: number = 1,
  limit: number = 5,
  sort: "asc" | "desc" = "desc"
) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { bookId },
      include: {
        user: true,
        likes: true,
      },
      orderBy: {
        createdAt: sort,
      },
      skip,
      take: limit,
    }),

    prisma.review.count({
      where: { bookId },
    }),
  ]);

  const formatted = reviews.map((review) => ({
    ...review,
    likesCount: review.likes.length,
    isLikedByUser: userId
      ? review.likes.some((like) => like.userId === userId)
      : false,
  }));

  return {
    reviews: formatted,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

/* =========================
   RADERA RECENSION
========================= */

export const deleteReview = async (
  reviewId: string,
  userId: string
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw { status: 404, message: "Recension hittades inte" };
  }

  if (review.userId !== userId) {
    throw { status: 403, message: "Du får inte ta bort denna recension" };
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  return { message: "Recension borttagen" };
};

/* =========================
   LIKE RECENSION
========================= */

export const likeReview = async (
  reviewId: string,
  userId: string
) => {
  // Kontrollera att recensionen finns
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw { status: 404, message: "Recension hittades inte" };
  }

  // Kontrollera om redan gillad
  const existing = await prisma.reviewLike.findFirst({
    where: {
      reviewId,
      userId,
    },
  });

  if (existing) {
    throw { status: 400, message: "Recensionen är redan gillad" };
  }

  await prisma.reviewLike.create({
    data: {
      reviewId,
      userId,
    },
  });

  return { message: "Gillad" };
};

/* =========================
   TA BORT LIKE
========================= */

export const unlikeReview = async (
  reviewId: string,
  userId: string
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw { status: 404, message: "Recension hittades inte" };
  }

  await prisma.reviewLike.deleteMany({
    where: {
      reviewId,
      userId,
    },
  });

  return { message: "Like borttagen" };
};