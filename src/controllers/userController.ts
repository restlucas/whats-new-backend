import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import userService from "../services/userService";
import bcrypt from "bcryptjs";
import { requestPwdReset } from "../utils/email";
import { uploadToFirebase } from "../utils/uploadHelper";

const secretKey = process.env.JWT_SECRET;

// CRUD: Create user
export const createUser = async (
  req: Request,
  res: Response
): Promise<void | any> => {
  const { token, ...rest } = req.body;
  const file = req.file;

  let invitationId = "";

  if (token) {
    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    );
    invitationId = (decoded as any).invitationId;
  }

  const formattedData = {
    ...rest,
    invitationId,
  };

  try {
    const user = await userService.createUser(formattedData.user);

    if ("error" in user) {
      return res.status(401).json({ message: user.error });
    }

    if (file) {
      const fileName = `user-profile-pic/${user.id}.jpg`;
      const profilePicUrl = await uploadToFirebase(file.buffer, fileName);
      await userService.updateImage(user.id, profilePicUrl);
    }

    return res.status(201).json({ message: "User created successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
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

    const response = await userService.updateProfile(data.userId as string, {
      image: profilePicUrl,
      name: data.name || "",
      password: hashedPassword || "",
    });
    res
      .status(201)
      .json({ message: "Profile updated successfully", user: response });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};

export const getLikesByUser = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;

  try {
    const likes = await userService.getLikes(userId);

    res.status(201).json({ likes: likes });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const makeLike = async (req: Request, res: Response) => {
  const { userId, newsId } = req.body;

  try {
    await userService.createLike(userId, newsId);
    res.status(201).json({ message: "Liked successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};

export const removeLike = async (req: Request, res: Response) => {
  const { userId, newsId } = req.body;

  try {
    await userService.deleteLike(userId as string, newsId as string);
    res.status(201).json({ message: "Like removed successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};

export const makeCommentLike = async (req: Request, res: Response) => {
  const { userId, commentId } = req.body;

  try {
    await userService.createCommentLike(userId, commentId);
    res.status(201).json({ message: "Liked successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};

export const removeCommentLike = async (req: Request, res: Response) => {
  const { userId, commentId } = req.body;
  try {
    await userService.deleteCommentLike(userId as string, commentId as string);
    res.status(201).json({ message: "Like removed successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { key, email } = req.body;

  const user = await userService.getUserByKey(key as "email", email as string);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const token = jwt.sign({ userId: user.id }, secretKey as string);

  await userService.createResetToken(user.id, token);

  const response = await requestPwdReset(token, user.email);
  res.status(200).json(response);
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

    res.status(200).json({ message: "Password successfully updated" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

export const validateToken = async (req: Request, res: Response) => {
  const token = req.query.token as string;

  if (!token) {
    res.status(200).json({ message: "Token is required" });
    return;
  }

  try {
    const tokenData = await userService.getResetToken(token);

    if (!tokenData) {
      res.status(200).json({ isValid: false, message: "Token not found" });
      return;
    }

    if (tokenData.used) {
      res
        .status(200)
        .json({ isValid: false, message: "Token has already been used" });
      return;
    }

    if (new Date() > tokenData.expiresAt) {
      res.status(200).json({ isValid: false, message: "Expired token" });
      return;
    }

    res.status(200).json({ isValid: true });
  } catch (error: unknown) {
    console.error("Unexpected error on create invite:", error);
    res.status(500).json({ message: "Unexpected error occurred" });
  }
};

// CRUD: get users
// export const getUsers = async (req: Request, res: Response) => {
//   const secretKey = req.query.secret_key as string;
//   if (secretKey !== process.env.SECRET_KEY) {
//     return res.status(403).json({ message: "Secret key invalid" });
//   }

//   const users = await prisma.user.findMany();
//   res.status(200).json(users);
// };

// // CRUD: update user
// export const updateUser = async (req: Request, res: Response) => {
//   const { name, email, password } = req.body;
//   const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

//   const updatedUser = await prisma.user.update({
//     where: { id: req.params.id },
//     data: {
//       name,
//       email,
//       password: hashedPassword,
//     },
//   });

//   res.status(200).json(updatedUser);
// };

// // CRUD: delete user
// export const deleteUser = async (req: Request, res: Response) => {
//   await prisma.user.delete({ where: { id: req.params.id } });
//   res.status(204).json({ message: "User deleted successfully" });
// };
