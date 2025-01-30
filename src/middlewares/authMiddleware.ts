import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";

interface CustomRequest extends Request {
  user?: User;
}

const authMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.["@whats-new:token"]; // Acessa o token corretamente

  if (!token) {
    res.status(401).json({ message: "Token not provided" });
    return; // Não retorna o objeto Response, mas encerra a execução
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as User;
    req.user = decoded; // Adiciona o usuário decodificado ao objeto da requisição
    next(); // Chama o próximo middleware ou rota
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
    return; // Não retorna o objeto Response
  }
};

export default authMiddleware;
