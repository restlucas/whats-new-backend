"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const newsController_1 = require("../controllers/newsController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
router.get("/", newsController_1.getAllNews);
router.get("/article", newsController_1.getFullArticle);
router.get("/team", authMiddleware_1.default, newsController_1.getResumeNewsByTeam);
router.get("/edit/history", authMiddleware_1.default, newsController_1.getEditHistoryByTeam);
router.post("/", authMiddleware_1.default, newsController_1.createNews);
router.post("/comment", authMiddleware_1.default, newsController_1.makeComment);
router.post("/article/views", newsController_1.incrementViews);
router.put("/", authMiddleware_1.default, newsController_1.updateNews);
router.delete("/", authMiddleware_1.default, newsController_1.deleteNews);
exports.default = router;
