import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const authService = {
  async check(token: string) {
    if (!token) {
      return { error: "Not authenticated" };
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
      if (err) {
        return { error: "Invalid token" };
      }
      return { user };
    });
  },

  async login(
    username: string,
    pwd: string,
    entranceRole: "READER" | "CREATOR"
  ) {
    let userFound = await prisma.user.findUnique({
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
      userFound = await prisma.user.findUnique({
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
  },
};

export default authService;
