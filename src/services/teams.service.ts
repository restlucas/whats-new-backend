import prisma from "../utils/db";
import { TeamRole } from "@prisma/client";
import { sendInviteEmail } from "./email.service";

const teamsService = {
  async createTeam(userId: string, teamName: string) {
    const teamNameExist = await prisma.team.findFirst({
      where: {
        name: teamName,
      },
    });

    if (teamNameExist) {
      return { error: "Team name already exists" };
    }

    const { id: teamId } = await prisma.team.create({
      data: {
        name: teamName,
      },
    });

    return await prisma.teamMember.create({
      data: {
        userId,
        teamId,
        role: TeamRole.OWNER,
      },
    });
  },

  async getAllByUser(userId: string) {
    return await prisma.team.findMany({
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
        members: {
          select: {
            role: true,
          },
        },
      },
    });
  },

  async getMembers(teamId: string) {
    return await prisma.teamMember.findMany({
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
  },

  async updateRole(teamId: string, userId: string, roleValue: string) {
    return await prisma.teamMember.update({
      where: {
        userId_teamId: {
          userId: userId,
          teamId: teamId,
        },
      },
      data: {
        role: roleValue as TeamRole,
      },
    });
  },

  async getInvitationsByTeam(teamId: string) {
    return await prisma.invitation.findMany({
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
  },

  async getInvitationsByUser(userEmail: string) {
    return await prisma.invitation.findMany({
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
  },

  async createInvite(teamId: string, userEmail: string) {
    const teamInfo = await prisma.team.findFirstOrThrow({
      where: {
        id: teamId,
      },
      select: {
        name: true,
      },
    });

    const userInSystem = (await prisma.user.findFirst({
      where: {
        email: userEmail,
      },
      select: {
        id: true,
      },
    })) as { id: string };

    if (!userInSystem) {
      return { error: "User is not in our system" };
    }

    const userAlreadyInvited = await prisma.invitation.findFirst({
      where: {
        teamId,
        userId: userInSystem.id,
      },
    });

    if (userAlreadyInvited) {
      return { error: "User already invited" };
    }

    const response = await prisma.invitation.create({
      data: {
        teamId,
        userId: userInSystem.id,
      },
    });

    try {
      await sendInviteEmail(response.id, teamInfo.name, userEmail);
    } catch (error) {
      console.error("Failed to send invitation email:", error);
      return { error: "Failed to send invitation email" };
    }

    return response;
  },

  async deleteInvite(inviteId: string) {
    return await prisma.invitation.delete({
      where: {
        id: inviteId,
      },
    });
  },

  async removeUser(teamId: string, userId: string) {
    return await prisma.teamMember.delete({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });
  },

  async getStatisticsByTeam(teamId: string, key: string) {
    if (key === null) {
      const result = await prisma.news.aggregate({
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
      const result = await prisma.like.count({
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

    const result = await prisma.news.aggregate({
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
  },

  async getLastFiveNewsAndTopUsers(teamId: string) {
    const lastFiveNews = await prisma.news.findMany({
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

    const users = await prisma.teamMember.findMany({
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
  },

  async updateTeamInvitation(
    userId: string,
    invitationId: string,
    status: "ACCEPTED" | "REJECTED"
  ) {
    if (status === "ACCEPTED") {
      const { teamId } = (await prisma.invitation.findUnique({
        where: {
          id: invitationId,
          userId,
        },
        select: {
          teamId: true,
        },
      })) as { teamId: string };

      await prisma.teamMember.create({
        data: {
          teamId,
          userId,
        },
      });
    }

    return await prisma.invitation.update({
      where: {
        id: invitationId,
      },
      data: {
        status,
      },
    });
  },
};

export default teamsService;
