import prisma from "../utils/db";
import bcrypt from "bcryptjs";

export interface CreateUserData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  invitationId: string;
  registerMode: "READER" | "CREATOR";
}

const userService = {
  async createUser(data: CreateUserData, registerMode: "CREATOR" | "READER") {
    const { name, username, email, password, invitationId } = data;

    const userUsernameExist = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (userUsernameExist) {
      return { error: "Username already exists" };
    }

    const userEmailExist = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (userEmailExist) {
      return { error: "Email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        role: registerMode,
      },
    });

    if (invitationId) {
      const invitationInfo = await prisma.invitation.update({
        where: {
          id: invitationId,
        },
        data: {
          status: "ACCEPTED",
        },
      });

      await prisma.teamMember.create({
        data: {
          teamId: invitationInfo.teamId,
          userId: user.id,
        },
      });
    }

    return user;
  },

  async getUserByKey(key: "id" | "username" | "email", value: string) {
    const whereCondition = { [key]: value };

    const user = await prisma.user.findFirst({
      where: whereCondition,
    });

    console.log(key, value);
    console.log(user);

    return user;
  },
  async updateProfile(
    userId: string,
    data: { image: string; name: string; password: string }
  ) {
    const { image, name, password } = data;
    const updateData: any = {};

    if (image !== "") updateData.image = image;
    if (name !== "") updateData.name = name;
    if (password !== "") updateData.password = password;

    return await prisma.user.update({
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
  },

  async updatePassword(userId: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return { error: "User not found" };
    }

    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newPassword,
      },
    });
  },

  async getUserFavorites(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  },

  async getLikes(userId: string) {
    const likes = await prisma.like.findMany({
      where: {
        userId,
      },
      select: {
        newsId: true,
      },
    });

    return likes.map((like) => like.newsId);
  },

  async createLike(userId: string, newsId: string) {
    return await prisma.like.create({
      data: {
        newsId,
        userId,
      },
    });
  },

  async deleteLike(userId: string, newsId: string) {
    return await prisma.like.delete({
      where: {
        userId_newsId: {
          userId,
          newsId,
        },
      },
    });
  },

  async createCommentLike(userId: string, commentId: string) {
    return await prisma.commentLike.create({
      data: {
        commentId,
        userId,
      },
    });
  },

  async deleteCommentLike(userId: string, commentId: string) {
    return await prisma.commentLike.delete({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });
  },

  async createResetToken(userId: string, token: string) {
    return await prisma.resetPasswordToken.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
  },

  async getResetToken(token: string) {
    return await prisma.resetPasswordToken.findUnique({
      where: {
        token,
      },
    });
  },

  async updateResetToken(token: string) {
    return await prisma.resetPasswordToken.update({
      where: {
        token,
      },
      data: {
        used: true,
      },
    });
  },

  async updateImage(userId: string, imageUrl: string) {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        image: imageUrl,
      },
    });
  },
};

export default userService;
