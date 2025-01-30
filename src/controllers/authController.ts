import { Request, Response } from "express";
import authService from "../services/authService";
import { serialize } from "cookie";

export const check = async (req: Request, res: Response): Promise<any> => {
  const token = req.cookies;

  if (!token["@whats-new:token"]) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const response = await authService.check(token["@whats-new:token"]);
    res.status(201).json({ message: "Authenticated", user: response });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<void | any> => {
  const { credentials, entranceMode } = req.body;

  const { username, password } = credentials;

  try {
    const response = await authService.login(username, password, entranceMode);

    if (response.error) {
      return res.status(401).json({ message: response.error });
    }

    const token = response.token;
    const user = response.user;

    const cookieString = serialize("@whats-new:token", token as string, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: "strict",
      path: "/",
    });

    res.setHeader("Set-Cookie", cookieString);

    res.status(201).json({ token, user });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const logout = (req: Request, res: Response): void | any => {
  const cookieString = serialize("@whats-new:token", "", {
    httpOnly: true,
    maxAge: 0, // Define o cookie com um tempo de vida de 0, o que o exclui
    sameSite: "strict",
    path: "/",
  });

  res.setHeader("Set-Cookie", cookieString);

  return res.status(200).json({ message: "Logged out successfully" });
};
