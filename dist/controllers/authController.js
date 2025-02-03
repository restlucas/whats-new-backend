"use strict";
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
exports.refresh = exports.logout = exports.login = exports.check = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authService_1 = __importDefault(require("../services/authService"));
const cookie_1 = require("cookie");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const token_1 = require("../utils/token");
const userService_1 = __importDefault(require("../services/userService"));
const check = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies["@whats-new:token"];
    if (!token) {
        res.json({ message: "No token provided", isValid: false, user: null });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("Invalid token:", err);
            return res.json({
                message: "Invalid token",
                isValid: false,
                user: null,
            });
        }
        return res.json({
            message: "Token is valid",
            isValid: true,
            user: decoded,
        });
    });
});
exports.check = check;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { credentials, entranceMode } = req.body;
    const { username, password } = credentials;
    try {
        const user = yield authService_1.default.login(username, password, entranceMode);
        if (!user)
            return res.status(401).json({ message: "User not found" });
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid)
            return res.status(401).json({ message: "Invalid credentials" });
        const { accessToken, refreshToken } = (0, token_1.generateTokens)(user.id);
        (0, token_1.setRefreshTokenCookie)(res, refreshToken);
        res.json({
            accessToken,
            user,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
    }
});
exports.login = login;
const logout = (req, res) => {
    const cookieString = (0, cookie_1.serialize)("@whats-new:token", "", {
        httpOnly: true,
        maxAge: 0, // Define o cookie com um tempo de vida de 0, o que o exclui
        sameSite: "strict",
        path: "/",
    });
    res.setHeader("Set-Cookie", cookieString);
    return res.status(200).json({ message: "Logged out successfully" });
};
exports.logout = logout;
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.json({ isValid: false, message: "Invalid token" });
        return;
    }
    try {
        const { userId } = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_SECRET);
        const user = yield userService_1.default.getUserByKey("id", userId);
        if (!user) {
            res.json({ isValid: false, message: "Invalid token" });
            return;
        }
        const { accessToken, refreshToken: newRefreshToken } = (0, token_1.generateTokens)(userId);
        (0, token_1.setRefreshTokenCookie)(res, newRefreshToken);
        res.json({ isValid: true, accessToken, user });
    }
    catch (error) {
        res.json({ isValid: false, message: "Invalid token" });
        return;
    }
});
exports.refresh = refresh;
