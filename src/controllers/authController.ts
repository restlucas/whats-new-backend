import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { Request, Response } from "express";
import authService from "../services/authService";
import { serialize } from "cookie";
import bcrypt from "bcryptjs";
import { generateTokens, setRefreshTokenCookie } from "../utils/token";
import userService from "../services/userService";

export const check = async (req: Request, res: Response) => {
  const token = req.cookies["@whats-new:token"];

  if (!token) {
    res.json({ message: "No token provided", isValid: false, user: null });
    return;
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
      if (err) {
        console.error("Invalid token:", err);
        return res.json({
          message: "Invalid token",
          isValid: false,
          user: null,
        });
      }

      return res.json({
        message: "Token is valid",
        isValid: true,
        user: decoded,
      });
    }
  );
};

export const login = async (
  req: Request,
  res: Response
): Promise<void | any> => {
  const { credentials, entranceMode } = req.body;

  const { username, password } = credentials;

  try {
    const user = await authService.login(username, password, entranceMode);

    if (!user) return res.status(401).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user.id);
    setRefreshTokenCookie(res, refreshToken);

    res.json({
      accessToken,
      user,
    });
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

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.json({ isValid: false, message: "Invalid token" });
    return;
  }

  try {
    const { userId } = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET!
    ) as { userId: string };

    const user = await userService.getUserByKey("id", userId);

    if (!user) {
      res.json({ isValid: false, message: "Invalid token" });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } =
      generateTokens(userId);
    setRefreshTokenCookie(res, newRefreshToken);

    res.json({ isValid: true, accessToken, user });
  } catch (error) {
    res.json({ isValid: false, message: "Invalid token" });
    return;
  }
};
