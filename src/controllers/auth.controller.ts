import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { Request, Response } from "express";
import authService from "../services/auth.service";
import bcrypt from "bcryptjs";
import {
  clearCookies,
  generateTokens,
  setRefreshTokenCookie,
} from "../utils/token";
import userService from "../services/user.service";
import responseHandler from "../utils/responseHandler";

export const check = async (req: Request, res: Response) => {
  const token = req.cookies["@whats-new:token"];

  if (!token) {
    return responseHandler.error(res, 400, "No token provided");
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
      if (err) {
        console.error("Invalid token:", err);
        return responseHandler.error(res, 400, "Invalid token");
      }

      return responseHandler.success(res, "Token is valid", { user: decoded });
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
    const foundUser = await authService.login(username, password, entranceMode);

    if (!foundUser) return responseHandler.error(res, 401, "User not found");

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid)
      return responseHandler.error(res, 401, "Invalid credentials");

    const { accessToken, refreshToken } = generateTokens(foundUser.id);
    setRefreshTokenCookie(res, refreshToken);

    const { password: _, ...user } = foundUser;

    responseHandler.success(res, "Login successful", {
      accessToken,
      user,
    });
  } catch (error: unknown) {
    responseHandler.error(
      res,
      500,
      error instanceof Error ? error.message : "An error occurred"
    );
  }
};

export const logout = (req: Request, res: Response): void | any => {
  clearCookies(res);
  return responseHandler.success(res, "Logged out successfully", {});
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return responseHandler.error(res, 400, "Invalid token");
  }

  try {
    const { userId } = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET!
    ) as { userId: string };

    const user = await userService.getUserByKey("id", userId);

    if (!user) {
      return responseHandler.error(res, 400, "Invalid token");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      generateTokens(userId);
    setRefreshTokenCookie(res, newRefreshToken);

    responseHandler.success(res, "Token refreshed successfully", {
      accessToken,
      user,
    });
  } catch (error) {
    return responseHandler.error(res, 400, "Invalid token");
  }
};
