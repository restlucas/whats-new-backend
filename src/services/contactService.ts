import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface MessageProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const contactService = {
  async createMessage(data: MessageProps) {
    return await prisma.contact.create({
      data,
    });
  },
};

export default contactService;
