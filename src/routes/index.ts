import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import newsRoutes from "./news.routes";
import teamRoutes from "./team.routes";
import contactRoutes from "./contact.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/news", newsRoutes);
router.use("/team", teamRoutes);
router.use("/contact", contactRoutes);

export default router;
