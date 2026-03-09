import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { z } from "zod";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});


const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

/* =========================
   REGISTER
========================= */

router.post("/register", async (req, res, next) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Ogiltig input",
        details: result.error.issues
      });
    }

    const { email, password } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: "Användaren finns redan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    res.status(201).json({
      message: "Användare skapad",
      userId: user.id
    });

  } catch (error) {
    next(error)
  }
});

/* =========================
   LOGIN
========================= */
/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res, next) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Ogiltig input",
        details: result.error.issues
      });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: "Felaktig email." });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Felaktigt lösenord." });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (error) {
    next(error);
  }
});

export default router;