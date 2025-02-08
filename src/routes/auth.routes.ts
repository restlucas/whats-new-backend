import { Router } from "express";
import { check, login, logout, refresh } from "../controllers/auth.controller";
import {
  requestPasswordReset,
  resetPassword,
  validateToken,
} from "../controllers/user.controller";

const router = Router();

router.get("/check", check);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/request-reset-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/validate-token", validateToken);

export default router;
