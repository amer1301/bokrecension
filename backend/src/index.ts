import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

import usersRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import reviewRoutes from "./routes/reviews";
import readingStatusRoutes from "./routes/readingStatus";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/reviews", reviewRoutes);
app.use("/reading-status", readingStatusRoutes);
app.use("/users", usersRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});