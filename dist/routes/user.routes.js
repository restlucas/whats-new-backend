"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const userController_1 = require("../controllers/userController");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = (0, express_1.Router)();
router.get("/likes", authMiddleware_1.default, userController_1.getLikesByUser);
router.post("/", upload.single("image"), userController_1.createUser);
router.post("/like", authMiddleware_1.default, userController_1.makeLike);
router.post("/like/comment", authMiddleware_1.default, userController_1.makeCommentLike);
router.put("/", upload.single("image"), userController_1.updateProfile);
router.delete("/like", authMiddleware_1.default, userController_1.removeLike);
router.delete("/like/comment", userController_1.removeCommentLike);
exports.default = router;
