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
const db_1 = __importDefault(require("../utils/db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userService = {
    createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, username, email, password, invitationId, registerMode: role, } = data;
            const userUsernameExist = yield db_1.default.user.findUnique({
                where: {
                    username,
                },
            });
            if (userUsernameExist) {
                return { error: "Username already exists" };
            }
            const userEmailExist = yield db_1.default.user.findFirst({
                where: {
                    email,
                },
            });
            if (userEmailExist) {
                return { error: "Email already exists" };
            }
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            const user = yield db_1.default.user.create({
                data: {
                    name,
                    username,
                    email,
                    password: hashedPassword,
                    role,
                },
            });
            if (invitationId) {
                const invitationInfo = yield db_1.default.invitation.update({
                    where: {
                        id: invitationId,
                    },
                    data: {
                        status: "ACCEPTED",
                    },
                });
                yield db_1.default.teamMember.create({
                    data: {
                        teamId: invitationInfo.teamId,
                        userId: user.id,
                    },
                });
            }
            return user;
        });
    },
    getUserByKey(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.default.user.findFirst({
                where: {
                    [key]: value,
                },
            });
            return user;
        });
    },
    updateProfile(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { image, name, password } = data;
            const updateData = {};
            if (image !== "")
                updateData.image = image;
            if (name !== "")
                updateData.name = name;
            if (password !== "")
                updateData.password = password;
            return yield db_1.default.user.update({
                where: {
                    id: userId,
                },
                data: updateData,
                select: {
                    id: true,
                    username: true,
                    name: true,
                    image: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
            });
        });
    },
    updatePassword(userId, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield db_1.default.user.findUnique({ where: { id: userId } });
            if (!user) {
                return { error: "User not found" };
            }
            return yield db_1.default.user.update({
                where: {
                    id: userId,
                },
                data: {
                    password: newPassword,
                },
            });
        });
    },
    getUserFavorites(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.user.findUnique({
                where: { id: userId },
            });
        });
    },
    getLikes(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const likes = yield db_1.default.like.findMany({
                where: {
                    userId,
                },
                select: {
                    newsId: true,
                },
            });
            return likes.map((like) => like.newsId);
        });
    },
    createLike(userId, newsId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.like.create({
                data: {
                    newsId,
                    userId,
                },
            });
        });
    },
    deleteLike(userId, newsId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.like.delete({
                where: {
                    userId_newsId: {
                        userId,
                        newsId,
                    },
                },
            });
        });
    },
    createCommentLike(userId, commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.commentLike.create({
                data: {
                    commentId,
                    userId,
                },
            });
        });
    },
    deleteCommentLike(userId, commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.commentLike.delete({
                where: {
                    userId_commentId: {
                        userId,
                        commentId,
                    },
                },
            });
        });
    },
    createResetToken(userId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.resetPasswordToken.create({
                data: {
                    userId,
                    token,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                },
            });
        });
    },
    getResetToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.resetPasswordToken.findUnique({
                where: {
                    token,
                },
            });
        });
    },
    updateResetToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.resetPasswordToken.update({
                where: {
                    token,
                },
                data: {
                    used: true,
                },
            });
        });
    },
    updateImage(userId, imageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.user.update({
                where: {
                    id: userId,
                },
                data: {
                    image: imageUrl,
                },
            });
        });
    },
};
exports.default = userService;
