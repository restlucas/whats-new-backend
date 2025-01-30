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
exports.logout = exports.login = exports.check = void 0;
const authService_1 = __importDefault(require("../services/authService"));
const cookie_1 = require("cookie");
const check = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies;
    if (!token["@whats-new:token"]) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const response = yield authService_1.default.check(token["@whats-new:token"]);
        res.status(201).json({ message: "Authenticated", user: response });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
});
exports.check = check;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { credentials, entranceMode } = req.body;
    const { username, password } = credentials;
    try {
        const response = yield authService_1.default.login(username, password, entranceMode);
        if (response.error) {
            return res.status(401).json({ message: response.error });
        }
        const token = response.token;
        const user = response.user;
        const cookieString = (0, cookie_1.serialize)("@whats-new:token", token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            sameSite: "strict",
            path: "/",
        });
        res.setHeader("Set-Cookie", cookieString);
        res.status(201).json({ token, user });
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
