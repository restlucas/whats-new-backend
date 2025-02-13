import jwt from "jsonwebtoken";
import { Response } from "express";

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_SECRET!, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_SECRET!, {
    expiresIn: "7d",
  });

  console.log(accessToken);

  return { accessToken, refreshToken };
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  });
};

export const clearCookies = (res: Response) => {
  res.setHeader("Set-Cookie", ["refreshToken=; HttpOnly; Path=/; Max-Age=0"]);
};
