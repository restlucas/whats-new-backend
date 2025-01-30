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
} from "../controllers/newsController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.get("/", getAllNews);
router.get("/article", getFullArticle);
router.get("/team", authMiddleware, getResumeNewsByTeam);
router.get("/edit/history", authMiddleware, getEditHistoryByTeam);
router.post("/", authMiddleware, createNews);
router.post("/comment", authMiddleware, makeComment);
router.post("/article/views", incrementViews);
router.put("/", authMiddleware, updateNews);
router.delete("/", authMiddleware, deleteNews);

export default router;
