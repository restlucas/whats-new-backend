import {
  PrismaClient,
  News as PrismaNews,
  Team as PrismaTeam,
  TeamMember as PrismaTeamMember,
  User as PrismaUser,
  Like as PrismaLike,
  TeamRole,
} from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { createSlug } from "../src/utils/slugify";

const prisma = new PrismaClient();

const imagesSrc = [
  "cover@1.jpg",
  "cover@2.jpg",
  "cover@3.jpg",
  "cover@4.jpg",
  "cover@5.jpg",
  "cover@6.jpg",
  "cover@7.jpg",
  "cover@8.jpg",
  "cover@9.jpg",
  "cover@10.jpg",
];

const categories = [
  "world",
  "general",
  "business",
  "entertainment",
  "health",
  "science",
  "sports",
  "technology",
  "games",
];
const countries = ["US"];

async function getRandomImageUrl() {
  const randomIndex = Math.floor(Math.random() * imagesSrc.length);

  return imagesSrc[randomIndex];
}

async function getRandomTeamMemberRow(): Promise<PrismaTeamMember | null> {
  const totalRecords = await prisma.team.count();

  if (totalRecords === 0) return null;

  const randomIndex = Math.floor(Math.random() * totalRecords);

  const randomRow = await prisma.teamMember.findMany({
    take: 1,
    skip: randomIndex,
  });

  return randomRow[0];
}

async function getRandomUserRow(): Promise<PrismaUser | null> {
  const totalRecords = await prisma.user.count();

  if (totalRecords === 0) return null;

  const randomIndex = Math.floor(Math.random() * totalRecords);

  const randomRow = await prisma.user.findMany({
    take: 1,
    skip: randomIndex,
  });

  return randomRow[0];
}

async function createSpecificUser() {
  const hashedPassword = await bcrypt.hash("123", 10);

  return await prisma.user.create({
    data: {
      name: "Lucas Souza de Oliveira",
      username: "restlucas",
      email: "restlucas.dev@gmail.com",
      role: "ADMIN",
      password: hashedPassword,
    },
  });
}

// Função para criar um usuário
async function createUser() {
  return await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      role: "CREATOR",
      password: faker.internet.password(),
    },
  });
}

async function createTeam() {
  const teams = [];
  const users = await prisma.user.findMany();

  if (!users.length) {
    throw new Error(
      "Nenhum usuário encontrado. Crie usuários antes de gerar times."
    );
  }

  const teamCount = 6;

  const getRandomRole = () => {
    const roles: TeamRole[] = ["EDITOR", "OWNER"];
    return faker.helpers.arrayElement(roles);
  };

  const selectRandomUsers = (users: any[], min = 2, max = 6) => {
    const teamSize = faker.number.int({ min, max });
    const shuffledUsers = faker.helpers.shuffle(users); // Embaralha os usuários
    const selectedUsers = shuffledUsers.slice(0, teamSize);

    return selectedUsers.map((user) => ({
      userId: user.id,
      role: getRandomRole(), // Seleciona um papel aleatório
    }));
  };

  for (let i = 0; i < teamCount; i++) {
    const teamName = faker.company.name();
    const team = await prisma.team.create({
      data: {
        name: teamName,
        members: {
          create: selectRandomUsers(users), // Adiciona membros aleatórios ao time
        },
      },
      include: { members: true },
    });
  }
}

// Função para criar notícias
async function createNews(country: string): Promise<PrismaNews[]> {
  const news: PrismaNews[] = []; // Tipando explicitamente o array como PrismaNews[]
  for (const category of categories) {
    for (let i = 0; i < 5; i++) {
      const title = faker.lorem.sentence(10); // Título com até 10 palavras
      const description = faker.lorem.sentence(30); // Descrição curta
      const content = faker.lorem.paragraphs(6); // Conteúdo com no mínimo 6 parágrafos
      const views = faker.number.int({ min: 10, max: 1000 }); // Views aleatórios
      const image = await getRandomImageUrl();

      const slug = createSlug(title);

      const { id: teamMemberId } =
        (await getRandomTeamMemberRow()) as PrismaTeamMember;

      const newsItem = await prisma.news.create({
        data: {
          image,
          title,
          slug,
          description,
          content,
          views,
          country,
          category,
          teamMemberId,
        },
      });

      news.push(newsItem);
    }
  }
  return news;
}

// Função para criar favoritos
async function createFavorites(newsList: PrismaNews[]) {
  const favoriteNews: PrismaLike[] = [];
  const randomNews = faker.helpers.shuffle(newsList).slice(0, 5); // Favoritar 5 notícias aleatórias

  const { id: userId } = (await getRandomUserRow()) as PrismaUser;

  for (const news of randomNews) {
    const favorite = await prisma.like.create({
      data: {
        userId,
        newsId: news.id,
      },
    });
    favoriteNews.push(favorite);
  }
}

// Função principal para popular o banco de dados
async function seedDatabase() {
  try {
    const specificUser = await createSpecificUser();
    console.log("Specific user created:", specificUser);

    // Criação de 10 usuários
    const users: PrismaUser[] = [];
    for (let i = 0; i < 5; i++) {
      const user = await createUser();
      users.push(user);
    }

    // Criação de 6 times
    await createTeam();

    for (const country of countries) {
      const newsList = await createNews(country);
      await createFavorites(newsList);
    }

    console.log("Banco de dados populado com sucesso!");
  } catch (error) {
    console.error("Erro ao popular banco de dados:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
