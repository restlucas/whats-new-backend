import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import userService, { CreateUserData } from "../services/user.service";
import bcrypt from "bcryptjs";
import { requestPwdReset } from "../utils/email";
import { uploadToFirebase } from "../utils/uploadHelper";
import responseHandler from "../utils/responseHandler";

const secretKey = process.env.JWT_SECRET;

export const createUser = async (
  req: Request,
  res: Response
): Promise<void | any> => {
  const { registerMode, user } = req.body;

  try {
    const createdUser = await userService.createUser(
      user as CreateUserData,
      registerMode as "CREATOR" | "READER"
    );

    if ("error" in createdUser) {
      return responseHandler.error(res, 401, createdUser.error);
    }

    responseHandler.created(res, "User created successfully", createdUser);
  } catch (error: unknown) {
    if (error instanceof Error) {
      responseHandler.error(res, 500, error.message);
    }
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const data = req.body;
  const file = req.file;

  try {
    let profilePicUrl = "";
    const hashedPassword = data.password
      ? await bcrypt.hash(data.password as string, 10)
      : "";

    if (file) {
      const fileName = `user-profile-pic/${data.userId}.jpg`;
      profilePicUrl = await uploadToFirebase(file.buffer, fileName);
      profilePicUrl = `${profilePicUrl}?v=${Date.now()}`;
    }

    const updatedUser = await userService.updateProfile(data.userId as string, {
      image: profilePicUrl,
      name: data.name || "",
      password: hashedPassword || "",
    });

    responseHandler.updated(res, "Profile updated successfully", updatedUser);
  } catch (error: unknown) {
    if (error instanceof Error) {
      responseHandler.error(res, 400, error.message);
    }
  }
};

export const getLikesByUser = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;

  try {
    const likes = await userService.getLikes(userId);
    responseHandler.success(res, "Likes retrieved successfully", likes);
  } catch (error: unknown) {
    if (error instanceof Error) {
      responseHandler.error(res, 500, error.message);
    }
  }
};

export const makeLike = async (req: Request, res: Response) => {
  const { userId, newsId } = req.body;

  try {
    await userService.createLike(userId, newsId);
    responseHandler.created(res, "Liked successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      responseHandler.error(res, 400, error.message);
    }
  }
};

export const removeLike = async (req: Request, res: Response) => {
  const { userId, newsId } = req.body;

  try {
    await userService.deleteLike(userId as string, newsId as string);
    responseHandler.deleted(res, "Like removed successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return responseHandler.error(res, 400, error.message);
    }
  }
};

export const makeCommentLike = async (req: Request, res: Response) => {
  const { userId, commentId } = req.body;

  try {
    await userService.createCommentLike(userId, commentId);
    responseHandler.created(res, "Liked successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return responseHandler.error(res, 400, error.message);
    }
  }
};

export const removeCommentLike = async (req: Request, res: Response) => {
  const { userId, commentId } = req.body;
  try {
    await userService.deleteCommentLike(userId as string, commentId as string);
    return responseHandler.deleted(res, "Like removed successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      responseHandler.error(res, 400, error.message);
    }
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { key, email } = req.body;

  console.log(email);

  try {
    const user = await userService.getUserByKey(
      key as "email",
      email as string
    );

    if (!user) {
      return responseHandler.error(res, 404, "User not found");
    }

    const token = jwt.sign({ userId: user.id }, secretKey as string);

    await userService.createResetToken(user.id, token);

    const response = await requestPwdReset(token, user.email);
    responseHandler.success(res, "Password reset requested", response);
  } catch (error: unknown) {
    console.error("Unexpected error on request password reset:", error);
    responseHandler.error(res, 500, "Unexpected error occurred");
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    await userService.updatePassword(decoded.userId, hashedPassword);
    await userService.updateResetToken(token);

    responseHandler.updated(res, "Password successfully updated");
  } catch (error) {
    responseHandler.error(res, 400, "Invalid or expired token");
  }
};

export const validateToken = async (req: Request, res: Response) => {
  const token = req.query.token as string;

  if (!token) {
    return responseHandler.error(res, 400, "Token is required");
  }

  try {
    const tokenData = await userService.getResetToken(token);

    if (!tokenData) {
      return responseHandler.error(res, 200, "Token not found");
    }

    if (tokenData.used) {
      return responseHandler.error(res, 200, "Token has already been used");
    }

    if (new Date() > tokenData.expiresAt) {
      return responseHandler.error(res, 200, "Expired token");
    }

    responseHandler.success(res, "Token is valid");
  } catch (error: unknown) {
    console.error("Unexpected error on validate token:", error);
    responseHandler.error(res, 500, "Unexpected error occurred");
  }
};
