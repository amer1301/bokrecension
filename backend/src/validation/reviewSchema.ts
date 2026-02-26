import { z } from "zod";

export const createReviewSchema = z.object({
  bookId: z.string().min(1, "BookId krävs"),

  text: z
    .string()
    .min(5, "Recensionen måste vara minst 5 tecken"),

  rating: z
    .number()
    .min(1, "Minsta betyg är 1")
    .max(5, "Högsta betyg är 5"),
});