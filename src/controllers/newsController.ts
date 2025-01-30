// import { Request, Response } from "express";
// import NewsService from "../services/newsService";

// class NewsController {
//   async create(req: Request, res: Response) {
//     const { title, content, userId, description, country, category } = req.body;
//     try {
//       const news = await NewsService.createNews(
//         title,
//         content,
//         userId,
//         description,
//         country,
//         category
//       );
//       res.status(201).json(news);
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         res.status(400).json({ error: error.message });
//       }
//     }
//   }

//   async getAll(req: Request, res: Response) {
//     const {
//       country,
//       category,
//       page = 1,
//       size = 20,
//       sortBy = "publishedAt",
//     } = req.query;

//     try {
//       // Chama o serviço para obter as notícias com os filtros e paginação
//       const newsList = await NewsService.getAllNews({
//         country: country as string | undefined,
//         category: category as string | undefined,
//         page: parseInt(page as string, 10),
//         size: parseInt(size as string, 10),
//         sortBy: sortBy as string,
//       });

//       // Retorna as notícias com a contagem total e a próxima página, se houver
//       res.status(200).json(newsList);
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         res.status(400).json({ error: error.message });
//       }
//     }
//   }

//   // Adicionar outros métodos como update, delete, etc.
// }

// export const newsController = new NewsController();

import { Request, Response } from "express";
import newsService from "../services/newsService";
import { createSlug } from "../utils/slugify";

export const createNews = async (req: Request, res: Response) => {
  const data = req.body;

  const slug = createSlug(data.fields.title);

  const formattedData = {
    ...data,
    fields: {
      ...data.fields,
      slug,
    },
  };

  try {
    const response = await newsService.createNews(formattedData);
    res.status(201).json(response);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};

export const updateNews = async (req: Request, res: Response) => {
  const data = req.body;

  try {
    const response = await newsService.updateNews(data);
    res.status(201).json(response);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};

export const deleteNews = async (req: Request, res: Response) => {
  const { newsId } = req.body;

  try {
    const response = await newsService.removeNews(newsId as string);
    res.json({ message: "News delete successfully", code: 200 });
  } catch (error: unknown) {
    console.error("Unexpected error on delete news:", error);
    res.status(500).json({ message: "Unexpected error occurred" });
  }
};

export const getAllNews = async (req: Request, res: Response): Promise<any> => {
  const secretKey = req.query.api_key as string;
  const {
    country,
    category,
    page = 1,
    size = 20,
    sortBy = "publishedAt",
  } = req.query;

  try {
    if (secretKey !== process.env.SECRET_KEY) {
      return res.status(403).json({ message: "Secret key invalid" });
    }

    const newsList = await newsService.getAllNews({
      country: country as string | undefined,
      category: category as string | undefined,
      page: parseInt(page as string, 10),
      size: parseInt(size as string, 10),
      sortBy: sortBy as string,
    });

    res.status(201).json(newsList);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const getResumeNewsByTeam = async (req: Request, res: Response) => {
  const { teamId, page = 1, pageSize = 10, filters } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const pageSizeNumber = parseInt(pageSize as string, 10);

  const skip = (pageNumber - 1) * pageSizeNumber;
  const take = pageSizeNumber;

  try {
    const totalNews = await newsService.countNewsByTeam(
      teamId as string,
      filters as { title: string; category: string }
    );
    const news = await newsService.getNewsByTeam(
      teamId as string,
      filters as { title: string; category: string },
      skip as number,
      take as number
    );

    res.json({
      totalNews,
      news,
      totalPages: Math.ceil(totalNews / pageSizeNumber),
      currentPage: page,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const getFullArticle = async (
  req: Request,
  res: Response
): Promise<any> => {
  const secretKey = req.query.api_key as string;
  const slug = req.query.slug as string;
  const userId = req.query.userId as string;

  try {
    if (secretKey !== process.env.SECRET_KEY) {
      res.status(403).json({ message: "Secret key invalid" });
    }

    const article = await newsService.getArticle(slug, userId);

    res.status(201).json(article);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const incrementViews = async (req: Request, res: Response) => {
  const { slug, api_key }: { slug: string; api_key: string } = req.body;

  try {
    if (api_key !== process.env.SECRET_KEY) {
      res.status(403).json({ message: "Secret key invalid" });
    }

    const response = await newsService.addView(slug);
    res.status(201).json({ message: "" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const makeComment = async (req: Request, res: Response) => {
  const { userId, newsId, comment } = req.body;

  try {
    await newsService.createComment(userId, newsId, comment);
    res.status(201).json({ message: "Comment created successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};

export const getEditHistoryByTeam = async (req: Request, res: Response) => {
  const teamId = req.query.teamId as string;

  try {
    const newsList = await newsService.getEditHistory(teamId);
    res.status(201).json(newsList);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

// CRUD: update news
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

// CRUD: delete news
// export const deleteUser = async (req: Request, res: Response) => {
//   await prisma.user.delete({ where: { id: req.params.id } });
//   res.status(204).json({ message: "User deleted successfully" });
// };
