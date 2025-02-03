import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Testing endpoint" });
});

export default router;
