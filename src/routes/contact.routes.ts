import { Router } from "express";
import { sendMessage } from "../controllers/contactController";

const router = Router();

router.post("/", sendMessage);

export default router;
