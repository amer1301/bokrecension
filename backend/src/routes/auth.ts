import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const router = Router();

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email och lösenord krävs" });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: "Användaren finns redan" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create ({
            data: {
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({
            message: "Användare skapad",
            userId: user.id,
        });
    } catch (error) {
        res.status(500).json({ error: "Något gick fel" });
    }
});

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: "Felaktig email." });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: "Felaktigt lösenord." });
        }

        console.log("LOGIN SECRET:", process.env.JWT_SECRET);
        
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Något gick fel." });
    }
});

export default router;