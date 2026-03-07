import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";

import usersRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import reviewRoutes from "./routes/reviews";
import readingStatusRoutes from "./routes/readingStatus";
import comments from "./routes/comments";
import likes from "./routes/likes";
import notifications from "./routes/notifications";
import feed from "./routes/feed"

dotenv.config();

const app = express();

/* =========================
   CORS CONFIG
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://bokrecension-frontend.onrender.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

/* =========================
   MIDDLEWARE
========================= */

app.use(express.json());

/* =========================
   ROUTES
========================= */

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/reviews", reviewRoutes);
app.use("/reading-status", readingStatusRoutes);

/* =========================
   ERROR HANDLER
========================= */

app.use(errorHandler);

/* =========================
   COMMENTS & LIKES
========================= */
app.use("/comments", comments);
app.use("/likes", likes);
app.use("/notifications", notifications)
app.use("/feed", feed)

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});