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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const newsService = {
    createNews(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fields, teamId, userId } = data;
            const { id: teamMemberId } = yield prisma.teamMember.findUniqueOrThrow({
                where: {
                    userId_teamId: {
                        userId,
                        teamId,
                    },
                },
            });
            return prisma.news.create({
                data: {
                    title: fields.title,
                    slug: fields.slug,
                    image: "https://picsum.photos/800/600",
                    content: fields.content,
                    description: fields.description,
                    country: "US",
                    category: fields.category,
                    teamMemberId: teamMemberId,
                },
            });
        });
    },
    updateNews(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fields, teamId, userId, slug } = data;
            const { id: teamMemberId } = (yield prisma.teamMember.findFirst({
                where: {
                    teamId,
                    userId,
                },
                select: {
                    id: true,
                },
            }));
            const { id: newsId } = (yield prisma.news.findUnique({
                where: {
                    slug,
                },
            }));
            yield prisma.newsEditHistory.create({
                data: {
                    newsId,
                    teamMemberId,
                },
            });
            return prisma.news.update({
                where: {
                    id: newsId,
                },
                data: {
                    title: fields.title,
                    content: fields.content,
                    description: fields.description,
                    country: "US",
                    category: fields.category,
                },
            });
        });
    },
    getAllNews(_a) {
        return __awaiter(this, arguments, void 0, function* ({ country, category, page, size, sortBy, }) {
            const filters = {};
            if (country)
                filters.country = country;
            if (category)
                filters.category = category;
            let orderBy = {};
            if (sortBy === "publishedAt") {
                orderBy = { createdAt: "desc" };
            }
            else if (sortBy === "likes") {
                orderBy = { likes: { _count: "desc" } };
            }
            else if (sortBy === "views") {
                orderBy = { views: "desc" };
            }
            const news = yield prisma.news.findMany({
                where: filters,
                orderBy: orderBy,
                skip: (page - 1) * size,
                take: size,
                include: {
                    teamMember: {
                        select: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
            });
            const total = yield prisma.news.count({
                where: filters,
            });
            const nextPage = page * size < total ? page + 1 : null;
            return {
                news,
                total,
                nextPage,
            };
        });
    },
    getNewsByTeam(teamId, filters, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.news.findMany({
                where: Object.assign(Object.assign(Object.assign({}, (filters.title &&
                    filters.title !== "" && {
                    title: {
                        contains: filters.title,
                    },
                })), (filters.category &&
                    filters.category !== "" && {
                    category: filters.category,
                })), { teamMember: {
                        team: {
                            id: teamId,
                        },
                    } }),
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    description: true,
                    category: true,
                    createdAt: true,
                },
                skip,
                take,
                orderBy: {
                    createdAt: "desc",
                },
            });
        });
    },
    getArticle(slug, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.news
                .findFirstOrThrow({
                where: {
                    slug,
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    image: true,
                    content: true,
                    country: true,
                    category: true,
                    createdAt: true,
                    updatedAt: true,
                    teamMember: {
                        select: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    comments: {
                        select: {
                            id: true,
                            content: true,
                            createdAt: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    image: true,
                                },
                            },
                            commentLike: {
                                select: {
                                    id: true,
                                    userId: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                    },
                },
            })
                .then((news) => (Object.assign(Object.assign({}, news), { comments: news.comments.map((_a) => {
                    var { commentLike } = _a, comment = __rest(_a, ["commentLike"]);
                    return (Object.assign(Object.assign({}, comment), { likeCount: commentLike.length, isLikedByUser: userId
                            ? commentLike.some((like) => like.userId === userId)
                            : false }));
                }) })));
        });
    },
    getEditHistory(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.newsEditHistory.findMany({
                where: {
                    teamMember: {
                        teamId,
                    },
                },
                select: {
                    news: {
                        select: {
                            title: true,
                            slug: true,
                        },
                    },
                    teamMember: {
                        select: {
                            user: {
                                select: {
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                    },
                    createdAt: true,
                    id: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        });
    },
    countNewsByTeam(teamId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.news.count({
                where: Object.assign(Object.assign(Object.assign({}, (filters.title &&
                    filters.title !== "" && {
                    title: {
                        contains: filters.title,
                    },
                })), (filters.category &&
                    filters.category !== "" && {
                    category: filters.category,
                })), { teamMember: {
                        teamId: teamId,
                    } }),
            });
        });
    },
    removeNews(newsId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.news.delete({
                where: {
                    id: newsId,
                },
            });
        });
    },
    addView(articleSlug) {
        return __awaiter(this, void 0, void 0, function* () {
            const { views: viewsAmount } = yield prisma.news.findFirstOrThrow({
                where: {
                    slug: articleSlug,
                },
                select: {
                    views: true,
                },
            });
            const totalViews = viewsAmount + 1;
            return yield prisma.news.update({
                where: {
                    slug: articleSlug,
                },
                data: {
                    views: totalViews,
                },
            });
        });
    },
    createComment(userId, newsId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.comment.create({
                data: {
                    userId,
                    newsId,
                    content,
                },
            });
        });
    },
};
exports.default = newsService;
