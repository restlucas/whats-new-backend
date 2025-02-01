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
const client_1 = require("@prisma/client");
const emailService_1 = require("./emailService");
const teamsService = {
    createTeam(userId, teamName) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamNameExist = yield db_1.default.team.findFirst({
                where: {
                    name: teamName,
                },
            });
            if (teamNameExist) {
                return { error: "Team name already exists" };
            }
            const { id: teamId } = yield db_1.default.team.create({
                data: {
                    name: teamName,
                },
            });
            return yield db_1.default.teamMember.create({
                data: {
                    userId,
                    teamId,
                    role: client_1.TeamRole.OWNER,
                },
            });
        });
    },
    getAllByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.team.findMany({
                where: {
                    members: {
                        some: {
                            userId: userId,
                        },
                    },
                },
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                },
            });
        });
    },
    getMembers(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.teamMember.findMany({
                where: {
                    teamId,
                },
                select: {
                    role: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                },
            });
        });
    },
    updateRole(teamId, userId, roleValue) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.teamMember.update({
                where: {
                    userId_teamId: {
                        userId: userId,
                        teamId: teamId,
                    },
                },
                data: {
                    role: roleValue,
                },
            });
        });
    },
    getInvitationsByTeam(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.invitation.findMany({
                where: {
                    teamId: teamId,
                    status: "PENDING",
                },
                select: {
                    id: true,
                    createdAt: true,
                    user: {
                        select: {
                            email: true,
                        },
                    },
                },
            });
        });
    },
    getInvitationsByUser(userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.invitation.findMany({
                where: {
                    status: "PENDING",
                    user: {
                        email: userEmail,
                    },
                },
                select: {
                    id: true,
                    createdAt: true,
                    user: {
                        select: {
                            email: true,
                        },
                    },
                    team: {
                        select: {
                            name: true,
                        },
                    },
                },
            });
        });
    },
    createInvite(teamId, userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamInfo = yield db_1.default.team.findFirstOrThrow({
                where: {
                    id: teamId,
                },
                select: {
                    name: true,
                },
            });
            const { id: userId } = (yield db_1.default.user.findFirst({
                where: {
                    email: userEmail,
                },
                select: {
                    id: true,
                },
            }));
            if (!userId) {
                return { error: "User is not in our system" };
            }
            const userAlreadyInvited = yield db_1.default.invitation.findFirst({
                where: {
                    teamId,
                    userId,
                },
            });
            if (userAlreadyInvited) {
                return { error: "User already invited" };
            }
            const response = yield db_1.default.invitation.create({
                data: {
                    teamId,
                    userId,
                },
            });
            try {
                yield (0, emailService_1.sendInviteEmail)(response.id, teamInfo.name, userEmail);
            }
            catch (error) {
                console.error("Failed to send invitation email:", error);
                return { error: "Failed to send invitation email" };
            }
            return response;
        });
    },
    deleteInvite(inviteId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.invitation.delete({
                where: {
                    id: inviteId,
                },
            });
        });
    },
    removeUser(teamId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.teamMember.delete({
                where: {
                    userId_teamId: {
                        userId,
                        teamId,
                    },
                },
            });
        });
    },
    getStatisticsByTeam(teamId, key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (key === null) {
                const result = yield db_1.default.news.aggregate({
                    _count: {
                        id: true,
                    },
                    where: {
                        teamMember: {
                            teamId: teamId,
                        },
                    },
                });
                return result._count.id;
            }
            if (key === "likes") {
                const result = yield db_1.default.like.count({
                    where: {
                        news: {
                            teamMember: {
                                teamId: teamId,
                            },
                        },
                    },
                });
                return result || 0;
            }
            const result = yield db_1.default.news.aggregate({
                _sum: {
                    [key]: true,
                },
                where: {
                    teamMember: {
                        teamId: teamId,
                    },
                },
            });
            return result._sum[key] || 0;
        });
    },
    getLastFiveNewsAndTopUsers(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            const lastFiveNews = yield db_1.default.news.findMany({
                where: {
                    teamMember: {
                        teamId: teamId,
                    },
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    createdAt: true,
                    views: true,
                    _count: {
                        select: {
                            likes: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 5,
            });
            const users = yield db_1.default.teamMember.findMany({
                where: {
                    teamId,
                },
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                    _count: {
                        select: {
                            news: true,
                        },
                    },
                    news: {
                        select: {
                            views: true,
                        },
                    },
                },
                orderBy: {
                    news: {
                        _count: "desc",
                    },
                },
                take: 5,
            });
            const topUsers = users.map((user) => ({
                id: user.user.id,
                name: user.user.name,
                totalNews: user._count.news,
                totalViews: user.news.reduce((sum, news) => sum + news.views, 0),
            }));
            return {
                lastFiveNews,
                topUsers,
            };
        });
    },
    updateTeamInvitation(userId, invitationId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            if (status === "ACCEPTED") {
                const { teamId } = (yield db_1.default.invitation.findUnique({
                    where: {
                        id: invitationId,
                        userId,
                    },
                    select: {
                        teamId: true,
                    },
                }));
                yield db_1.default.teamMember.create({
                    data: {
                        teamId,
                        userId,
                    },
                });
            }
            return yield db_1.default.invitation.update({
                where: {
                    id: invitationId,
                },
                data: {
                    status,
                },
            });
        });
    },
};
exports.default = teamsService;
