"use strict";
// import { Request, Response } from "express";
// import NewsService from "../services/newsService";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEditHistoryByTeam = exports.makeComment = exports.incrementViews = exports.getFullArticle = exports.getResumeNewsByTeam = exports.getAllNews = exports.deleteNews = exports.updateNews = exports.createNews = void 0;
const newsService_1 = __importDefault(require("../services/newsService"));
const slugify_1 = require("../utils/slugify");
const createNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const slug = (0, slugify_1.createSlug)(data.fields.title);
    const formattedData = Object.assign(Object.assign({}, data), { fields: Object.assign(Object.assign({}, data.fields), { slug }) });
    try {
        const response = yield newsService_1.default.createNews(formattedData);
        res.status(201).json(response);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});
exports.createNews = createNews;
const updateNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    try {
        const response = yield newsService_1.default.updateNews(data);
        res.status(201).json(response);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});
exports.updateNews = updateNews;
const deleteNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newsId } = req.body;
    try {
        const response = yield newsService_1.default.removeNews(newsId);
        res.json({ message: "News delete successfully", code: 200 });
    }
    catch (error) {
        console.error("Unexpected error on delete news:", error);
        res.status(500).json({ message: "Unexpected error occurred" });
    }
});
exports.deleteNews = deleteNews;
const getAllNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const secretKey = req.query.api_key;
    const { country, category, page = 1, size = 20, sortBy = "publishedAt", } = req.query;
    try {
        if (secretKey !== process.env.SECRET_KEY) {
            return res.status(403).json({ message: "Secret key invalid" });
        }
        const newsList = yield newsService_1.default.getAllNews({
            country: country,
            category: category,
            page: parseInt(page, 10),
            size: parseInt(size, 10),
            sortBy: sortBy,
        });
        res.status(201).json(newsList);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
    }
});
exports.getAllNews = getAllNews;
const getResumeNewsByTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teamId, page = 1, pageSize = 10, filters } = req.query;
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);
    const skip = (pageNumber - 1) * pageSizeNumber;
    const take = pageSizeNumber;
    try {
        const totalNews = yield newsService_1.default.countNewsByTeam(teamId, filters);
        const news = yield newsService_1.default.getNewsByTeam(teamId, filters, skip, take);
        res.json({
            totalNews,
            news,
            totalPages: Math.ceil(totalNews / pageSizeNumber),
            currentPage: page,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
    }
});
exports.getResumeNewsByTeam = getResumeNewsByTeam;
const getFullArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const secretKey = req.query.api_key;
    const slug = req.query.slug;
    const userId = req.query.userId;
    try {
        if (secretKey !== process.env.SECRET_KEY) {
            res.status(403).json({ message: "Secret key invalid" });
        }
        const article = yield newsService_1.default.getArticle(slug, userId);
        res.status(201).json(article);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
    }
});
exports.getFullArticle = getFullArticle;
const incrementViews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug, api_key } = req.body;
    try {
        if (api_key !== process.env.SECRET_KEY) {
            res.status(403).json({ message: "Secret key invalid" });
        }
        const response = yield newsService_1.default.addView(slug);
        res.status(201).json({ message: "" });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
    }
});
exports.incrementViews = incrementViews;
const makeComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, newsId, comment } = req.body;
    try {
        yield newsService_1.default.createComment(userId, newsId, comment);
        res.status(201).json({ message: "Comment created successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});
exports.makeComment = makeComment;
const getEditHistoryByTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const teamId = req.query.teamId;
    try {
        const newsList = yield newsService_1.default.getEditHistory(teamId);
        res.status(201).json(newsList);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
    }
});
exports.getEditHistoryByTeam = getEditHistoryByTeam;
// CRUD: update news
// export const updateUser = async (req: Request, res: Response) => {
//   const { name, email, password } = req.body;
//   const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
//   const updatedUser = await prisma.user.update({
//     where: { id: req.params.id },
//     data: {
//       name,
//       email,
//       password: hashedPassword,
//     },
//   });
//   res.status(200).json(updatedUser);
// };
// CRUD: delete news
// export const deleteUser = async (req: Request, res: Response) => {
//   await prisma.user.delete({ where: { id: req.params.id } });
//   res.status(204).json({ message: "User deleted successfully" });
// };
