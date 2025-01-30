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
exports.handleTeamInvite = exports.getLastNewsAndTopUsers = exports.getStatistics = exports.removeMember = exports.validateInvitation = exports.revokeInvitation = exports.makeInvitation = exports.getTeamInvitations = exports.getMemberInvitations = exports.updateMemberRole = exports.getMembersByTeam = exports.getAllTeamsByUser = exports.create = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const teamsService_1 = __importDefault(require("../services/teamsService"));
// Create team
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, teamName } = req.body;
    try {
        const news = yield teamsService_1.default.createTeam(userId, teamName);
        res.status(201).json(news);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});
exports.create = create;
// Get all teams by user
const getAllTeamsByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.query;
    try {
        const response = yield teamsService_1.default.getAllByUser(userId);
        res.status(201).json(response);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});
exports.getAllTeamsByUser = getAllTeamsByUser;
// Get all members by team
const getMembersByTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teamId } = req.query;
    try {
        const members = yield teamsService_1.default.getMembers(teamId);
        res.status(201).json(members);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});
exports.getMembersByTeam = getMembersByTeam;
const updateMemberRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamId, userId, roleValue } = req.body;
        try {
            const response = yield teamsService_1.default.updateRole(teamId, userId, roleValue);
            res.status(201).json(response);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
        }
    }
    catch (error) {
        console.error("Error on update member role:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateMemberRole = updateMemberRole;
const getMemberInvitations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamId } = req.query;
        try {
            const response = yield teamsService_1.default.getInvitationsByTeam(teamId);
            res.status(201).json(response);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
        }
    }
    catch (error) {
        console.error("Erro ao atualizar o papel:", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
});
exports.getMemberInvitations = getMemberInvitations;
const getTeamInvitations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userEmail } = req.query;
        try {
            const response = yield teamsService_1.default.getInvitationsByUser(userEmail);
            res.status(201).json(response);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
        }
    }
    catch (error) {
        console.error("Erro ao atualizar o papel:", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
});
exports.getTeamInvitations = getTeamInvitations;
const makeInvitation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teamId, userEmail } = req.body;
    try {
        const response = yield teamsService_1.default.createInvite(teamId, userEmail);
        if ("error" in response) {
            res.status(400).json({ error: response.error });
            return;
        }
        res.status(201).json(response);
    }
    catch (error) {
        console.error("Unexpected error on create invite:", error);
        res.status(500).json({ message: "Unexpected error occurred" });
    }
});
exports.makeInvitation = makeInvitation;
const revokeInvitation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { inviteId } = req.body;
    try {
        const response = yield teamsService_1.default.deleteInvite(inviteId);
        res.status(201).json(response);
    }
    catch (error) {
        console.error("Unexpected error on create invite:", error);
        res.status(500).json({ message: "Unexpected error occurred" });
    }
});
exports.revokeInvitation = revokeInvitation;
const validateInvitation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.query;
    try {
        const { invitationId, email } = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        let redirect = `/auth/creator?method=register&email=${email}`;
        let message = `Token is valid, redirecting to register page!`;
        const userInSystem = yield teamsService_1.default.getInvitationsByUser(email);
        if (userInSystem) {
            redirect = "/auth/creator?method=login";
            message = "Make login and access system to accept invite!";
        }
        res.status(200).json({ message, redirect });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.name === "TokenExpiredError") {
                res
                    .status(400)
                    .json({ message: "Token expired", code: "TOKEN_EXPIRED" });
            }
            else {
                res
                    .status(400)
                    .json({ message: "Invalid token", code: "INVALID_TOKEN" });
            }
        }
        else {
            res.status(500).json({ message: "An unexpected error occurred" });
        }
    }
});
exports.validateInvitation = validateInvitation;
const removeMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teamId, memberId } = req.body;
    try {
        const response = yield teamsService_1.default.removeUser(teamId, memberId);
        res.status(201).json(response);
    }
    catch (error) {
        console.error("Unexpected error on remove member:", error);
        res.status(500).json({ message: "Unexpected error occurred" });
    }
});
exports.removeMember = removeMember;
const getStatistics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teamId, type } = req.query;
    let key = null;
    switch (type) {
        case "recentViews":
            key = "views";
            break;
        case "likeRate":
            key = "likes";
            break;
        default:
            break;
    }
    const response = yield teamsService_1.default.getStatisticsByTeam(teamId, key);
    res.status(201).json({ data: response });
});
exports.getStatistics = getStatistics;
const getLastNewsAndTopUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teamId } = req.query;
    const response = yield teamsService_1.default.getLastFiveNewsAndTopUsers(teamId);
    res.status(201).json({ data: response });
});
exports.getLastNewsAndTopUsers = getLastNewsAndTopUsers;
const handleTeamInvite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, invitationId, action } = req.body;
    try {
        const response = yield teamsService_1.default.updateTeamInvitation(userId, invitationId, action);
        res.status(201).json({ message: "Success", user: response });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
    }
});
exports.handleTeamInvite = handleTeamInvite;
