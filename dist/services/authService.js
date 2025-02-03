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
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const authService = {
    check(token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token) {
                return { error: "Not authenticated" };
            }
            jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (err) {
                    return { error: "Invalid token" };
                }
                return { user };
            });
        });
    },
    login(username, pwd, entranceRole) {
        return __awaiter(this, void 0, void 0, function* () {
            let userFound = yield prisma.user.findUnique({
                where: {
                    username,
                    role: entranceRole,
                },
                select: {
                    id: true,
                    image: true,
                    role: true,
                    name: true,
                    username: true,
                    email: true,
                    password: true,
                    createdAt: true,
                },
            });
            if (!userFound) {
                userFound = yield prisma.user.findUnique({
                    where: {
                        username,
                        role: "ADMIN",
                    },
                    select: {
                        id: true,
                        role: true,
                        image: true,
                        name: true,
                        username: true,
                        email: true,
                        password: true,
                        createdAt: true,
                    },
                });
            }
            return userFound;
        });
    },
};
exports.default = authService;
