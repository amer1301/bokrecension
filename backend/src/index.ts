import express from "express";
import cors from "cors";
import dotenv from "dotenv";

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

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});