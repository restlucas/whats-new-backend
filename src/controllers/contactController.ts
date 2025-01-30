import { Request, Response } from "express";
import contactService, { MessageProps } from "../services/contactService";

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void | any> => {
  const { name, email, subject, message } = req.body;

  try {
    await contactService.createMessage({
      name,
      email,
      subject,
      message,
    } as MessageProps);
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};
