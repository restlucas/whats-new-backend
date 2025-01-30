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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
            if (!userFound || !(yield bcryptjs_1.default.compare(pwd, userFound.password))) {
                return { error: "Invalid credentials" };
            }
            const token = jsonwebtoken_1.default.sign({ id: userFound.id }, process.env.JWT_SECRET, {
                expiresIn: "24h",
            });
            const { password } = userFound, user = __rest(userFound, ["password"]);
            return { token, user };
        });
    },
};
exports.default = authService;
