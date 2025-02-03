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
exports.validateToken = exports.resetPassword = exports.requestPasswordReset = exports.removeCommentLike = exports.makeCommentLike = exports.removeLike = exports.makeLike = exports.getLikesByUser = exports.updateProfile = exports.createUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userService_1 = __importDefault(require("../services/userService"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const email_1 = require("../utils/email");
const uploadHelper_1 = require("../utils/uploadHelper");
const secretKey = process.env.JWT_SECRET;
// CRUD: Create user
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { token } = _a, rest = __rest(_a, ["token"]);
    const file = req.file;
    let invitationId = "";
    if (token) {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        invitationId = decoded.invitationId;
    }
    const formattedData = Object.assign(Object.assign({}, rest), { invitationId });
    try {
        const user = yield userService_1.default.createUser(formattedData.user);
        if ("error" in user) {
            return res.status(401).json({ message: user.error });
        }
        if (file) {
            const fileName = `user-profile-pic/${user.id}.jpg`;
            const profilePicUrl = yield (0, uploadHelper_1.uploadToFirebase)(file.buffer, fileName);
            yield userService_1.default.updateImage(user.id, profilePicUrl);
        }
        return res.status(201).json({ message: "User created successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
    }
});
exports.createUser = createUser;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const file = req.file;
    try {
        let profilePicUrl = "";
        const hashedPassword = data.password
            ? yield bcryptjs_1.default.hash(data.password, 10)
            : "";
        if (file) {
            const fileName = `user-profile-pic/${data.userId}.jpg`;
            profilePicUrl = yield (0, uploadHelper_1.uploadToFirebase)(file.buffer, fileName);
            profilePicUrl = `${profilePicUrl}?v=${Date.now()}`;
        }
        const response = yield userService_1.default.updateProfile(data.userId, {
            image: profilePicUrl,
            name: data.name || "",
            password: hashedPassword || "",
        });
        res
            .status(201)
            .json({ message: "Profile updated successfully", user: response });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});
exports.updateProfile = updateProfile;
const getLikesByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.userId;
    try {
        const likes = yield userService_1.default.getLikes(userId);
        res.status(201).json({ likes: likes });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
    }
});
exports.getLikesByUser = getLikesByUser;
const makeLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, newsId } = req.body;
    try {
        yield userService_1.default.createLike(userId, newsId);
        res.status(201).json({ message: "Liked successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});
exports.makeLike = makeLike;
const removeLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, newsId } = req.body;
    try {
        yield userService_1.default.deleteLike(userId, newsId);
        res.status(201).json({ message: "Like removed successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});
exports.removeLike = removeLike;
const makeCommentLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, commentId } = req.body;
    try {
        yield userService_1.default.createCommentLike(userId, commentId);
        res.status(201).json({ message: "Liked successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});
exports.makeCommentLike = makeCommentLike;
const removeCommentLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, commentId } = req.body;
    try {
        yield userService_1.default.deleteCommentLike(userId, commentId);
        res.status(201).json({ message: "Like removed successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});
exports.removeCommentLike = removeCommentLike;
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { key, email } = req.body;
    const user = yield userService_1.default.getUserByKey(key, email);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, secretKey);
    yield userService_1.default.createResetToken(user.id, token);
    const response = yield (0, email_1.requestPwdReset)(token, user.email);
    res.status(200).json(response);
});
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    try {
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        yield userService_1.default.updatePassword(decoded.userId, hashedPassword);
        yield userService_1.default.updateResetToken(token);
        res.status(200).json({ message: "Password successfully updated" });
    }
    catch (error) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
});
exports.resetPassword = resetPassword;
const validateToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.query.token;
    if (!token) {
        res.status(200).json({ message: "Token is required" });
        return;
    }
    try {
        const tokenData = yield userService_1.default.getResetToken(token);
        if (!tokenData) {
            res.status(200).json({ isValid: false, message: "Token not found" });
            return;
        }
        if (tokenData.used) {
            res
                .status(200)
                .json({ isValid: false, message: "Token has already been used" });
            return;
        }
        if (new Date() > tokenData.expiresAt) {
            res.status(200).json({ isValid: false, message: "Expired token" });
            return;
        }
        res.status(200).json({ isValid: true });
    }
    catch (error) {
        console.error("Unexpected error on create invite:", error);
        res.status(500).json({ message: "Unexpected error occurred" });
    }
});
exports.validateToken = validateToken;
// CRUD: get users
// export const getUsers = async (req: Request, res: Response) => {
//   const secretKey = req.query.secret_key as string;
//   if (secretKey !== process.env.SECRET_KEY) {
//     return res.status(403).json({ message: "Secret key invalid" });
//   }
//   const users = await prisma.user.findMany();
//   res.status(200).json(users);
// };
// // CRUD: update user
// export const updateUser = async (req: Request, res: Response) => {
//   const { name, email, password } = req.body;
//   const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
//   const updatedUser = await prisma.user.update({
//     where: { id: req.params.id },
//     data: {
//       name,
//       email,
//       password: hashedPassword,
//     },
//   });
//   res.status(200).json(updatedUser);
// };
// // CRUD: delete user
// export const deleteUser = async (req: Request, res: Response) => {
//   await prisma.user.delete({ where: { id: req.params.id } });
//   res.status(204).json({ message: "User deleted successfully" });
// };
