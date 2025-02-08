import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface GetAllNewsParams {
  country?: string;
  category?: string;
  page: number;
  size: number;
  sortBy: string;
}

interface CreateNewsProps {
  fields: {
    title: string;
    slug: string;
    description: string;
    category: string;
    content: string;
  };
}

interface EditNewsProps {
  fields: {
    title: string;
    description: string;
    category: string;
    content: string;
  };
  slug: string;
  teamId: string;
  userId: string;
}

const newsService = {
  async createNews(teamId: string, userId: string, data: CreateNewsProps) {
    const { fields } = data;

    const { id: teamMemberId } = await prisma.teamMember.findUniqueOrThrow({
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
  },

  async updateNews(data: EditNewsProps) {
    const { fields, teamId, userId, slug } = data;

    const { id: teamMemberId } = (await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
      select: {
        id: true,
      },
    })) as { id: string };

    const { id: newsId } = (await prisma.news.findUnique({
      where: {
        slug,
      },
    })) as { id: string };

    await prisma.newsEditHistory.create({
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
  },

  async getAllNews({
    country,
    category,
    page,
    size,
    sortBy,
  }: GetAllNewsParams) {
    const filters: any = {};
    if (country) filters.country = country;
    if (category) filters.category = category;

    let orderBy: any = {};
    if (sortBy === "publishedAt") {
      orderBy = { createdAt: "desc" };
    } else if (sortBy === "likes") {
      orderBy = { likes: { _count: "desc" } };
    } else if (sortBy === "views") {
      orderBy = { views: "desc" };
    }

    const news = await prisma.news.findMany({
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

    const total = await prisma.news.count({
      where: filters,
    });

    const nextPage = page * size < total ? page + 1 : null;

    return {
      news,
      total,
      nextPage,
    };
  },

  async getNewsByTeam(
    teamId: string,
    filters: { title: string; category: string },
    skip: number,
    take: number
  ) {
    return await prisma.news.findMany({
      where: {
        ...(filters.title &&
          filters.title !== "" && {
            title: {
              contains: filters.title,
            },
          }),
        ...(filters.category &&
          filters.category !== "" && {
            category: filters.category,
          }),
        teamMember: {
          team: {
            id: teamId,
          },
        },
      },
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
  },

  async getArticle(slug: string, userId?: string) {
    return await prisma.news
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
      .then((news) => ({
        ...news,
        comments: news.comments.map(({ commentLike, ...comment }) => ({
          ...comment,
          likeCount: commentLike.length,
          isLikedByUser: userId
            ? commentLike.some((like) => like.userId === userId)
            : false,
        })),
      }));
  },

  async getEditHistory(teamId: string) {
    return await prisma.newsEditHistory.findMany({
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
  },

  async countNewsByTeam(
    teamId: string,
    filters: { title: string; category: string }
  ) {
    return await prisma.news.count({
      where: {
        ...(filters.title &&
          filters.title !== "" && {
            title: {
              contains: filters.title,
            },
          }),
        ...(filters.category &&
          filters.category !== "" && {
            category: filters.category,
          }),
        teamMember: {
          teamId: teamId,
        },
      },
    });
  },

  async removeNews(newsId: string) {
    return await prisma.news.delete({
      where: {
        id: newsId,
      },
    });
  },

  async addView(articleSlug: string) {
    const { views: viewsAmount } = await prisma.news.findFirstOrThrow({
      where: {
        slug: articleSlug,
      },
      select: {
        views: true,
      },
    });

    const totalViews = viewsAmount + 1;

    return await prisma.news.update({
      where: {
        slug: articleSlug,
      },
      data: {
        views: totalViews,
      },
    });
  },

  async createComment(userId: string, newsId: string, content: string) {
    return await prisma.comment.create({
      data: {
        userId,
        newsId,
        content,
      },
    });
  },
};

export default newsService;
