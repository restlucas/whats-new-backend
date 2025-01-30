"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a["@whats-new:token"]; // Acessa o token corretamente
    if (!token) {
        res.status(401).json({ message: "Token not provided" });
        return; // Não retorna o objeto Response, mas encerra a execução
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adiciona o usuário decodificado ao objeto da requisição
        next(); // Chama o próximo middleware ou rota
    }
    catch (err) {
        res.status(401).json({ message: "Invalid token" });
        return; // Não retorna o objeto Response
    }
};
exports.default = authMiddleware;
