import { Router } from "express";
import multer from "multer";
import authMiddleware from "../middlewares/authMiddleware";
import {
  createUser,
  getLikesByUser,
  makeCommentLike,
  makeLike,
  removeCommentLike,
  removeLike,
  updateProfile,
} from "../controllers/user.controller";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/likes", authMiddleware, getLikesByUser);
router.post("/", upload.single("image"), createUser);
router.post("/like", authMiddleware, makeLike);
router.post("/like/comment", authMiddleware, makeCommentLike);
router.put("/", upload.single("image"), updateProfile);
router.delete("/like", authMiddleware, removeLike);
router.delete("/like/comment", removeCommentLike);

export default router;
