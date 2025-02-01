import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";

interface CustomRequest extends Request {
  user?: User;
  userId?: string;
}

const authMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token not provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET!) as {
      userId: string;
    };

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
    return;
  }
};

export default authMiddleware;
