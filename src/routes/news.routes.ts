import { Router } from "express";
import {
  createNews,
  deleteNews,
  getAllNews,
  getEditHistoryByTeam,
  getFullArticle,
  getResumeNewsByTeam,
  incrementViews,
  makeComment,
  updateNews,
} from "../controllers/news.controller";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.get("/", getAllNews);
router.get("/article", getFullArticle);
router.get("/team/:teamId", authMiddleware, getResumeNewsByTeam);
router.get("/edit/history/:teamId", authMiddleware, getEditHistoryByTeam);
router.post("/:teamId/:userId", authMiddleware, createNews);
router.post("/comment/:userId/:newsId", authMiddleware, makeComment);
router.post("/article/views", incrementViews);
router.put("/", authMiddleware, updateNews);
router.delete("/:newsId", authMiddleware, deleteNews);

export default router;
