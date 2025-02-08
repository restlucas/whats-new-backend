import { Request, Response } from "express";
import newsService from "../services/news.service";
import { createSlug } from "../utils/slugify";
import responseHandler from "../utils/responseHandler";

export const createNews = async (req: Request, res: Response) => {
  const { teamId, userId } = req.params;
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
    const response = await newsService.createNews(
      teamId,
      userId,
      formattedData
    );
    responseHandler.created(res, "News created successfully", response);
  } catch (error: unknown) {
    responseHandler.error(
      res,
      400,
      error instanceof Error ? error.message : "An error occurred"
    );
  }
};

export const updateNews = async (req: Request, res: Response) => {
  const data = req.body;

  try {
    const response = await newsService.updateNews(data);
    responseHandler.updated(res, "News updated successfully", response);
  } catch (error: unknown) {
    responseHandler.error(
      res,
      400,
      error instanceof Error ? error.message : "An error occurred"
    );
  }
};

export const deleteNews = async (req: Request, res: Response) => {
  const { newsId } = req.params;

  try {
    const response = await newsService.removeNews(newsId as string);
    responseHandler.success(res, "News deleted successfully", response);
  } catch (error: unknown) {
    console.error("Unexpected error on delete news:", error);
    responseHandler.error(
      res,
      500,
      error instanceof Error ? error.message : "Unexpected error occurred"
    );
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
      return responseHandler.error(res, 403, "Secret key invalid");
    }

    const newsList = await newsService.getAllNews({
      country: country as string | undefined,
      category: category as string | undefined,
      page: parseInt(page as string, 10),
      size: parseInt(size as string, 10),
      sortBy: sortBy as string,
    });

    responseHandler.success(res, "News fetched successfully", newsList);
  } catch (error: unknown) {
    responseHandler.error(
      res,
      500,
      error instanceof Error ? error.message : "An error occurred"
    );
  }
};

export const getResumeNewsByTeam = async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const { page = 1, pageSize = 10, filters } = req.query;

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

    responseHandler.success(res, "News fetched by team successfully", {
      totalNews,
      news,
      totalPages: Math.ceil(totalNews / pageSizeNumber),
      currentPage: page,
    });
  } catch (error: unknown) {
    responseHandler.error(
      res,
      500,
      error instanceof Error ? error.message : "An error occurred"
    );
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
      return responseHandler.error(res, 403, "Secret key invalid");
    }

    const article = await newsService.getArticle(slug, userId);
    responseHandler.success(res, "Article fetched successfully", article);
  } catch (error: unknown) {
    responseHandler.error(
      res,
      500,
      error instanceof Error ? error.message : "An error occurred"
    );
  }
};

export const incrementViews = async (req: Request, res: Response) => {
  const { slug, api_key }: { slug: string; api_key: string } = req.body;

  try {
    if (api_key !== process.env.SECRET_KEY) {
      return responseHandler.error(res, 403, "Secret key invalid");
    }

    await newsService.addView(slug);
    responseHandler.success(res, "View incremented successfully", {});
  } catch (error: unknown) {
    responseHandler.error(
      res,
      500,
      error instanceof Error ? error.message : "An error occurred"
    );
  }
};

export const makeComment = async (req: Request, res: Response) => {
  const { userId, newsId } = req.params;
  const { comment } = req.body;

  try {
    await newsService.createComment(userId, newsId, comment);
    responseHandler.success(res, "Comment created successfully", {});
  } catch (error: unknown) {
    responseHandler.error(
      res,
      400,
      error instanceof Error ? error.message : "An error occurred"
    );
  }
};

export const getEditHistoryByTeam = async (req: Request, res: Response) => {
  const { teamId } = req.params;

  try {
    const newsList = await newsService.getEditHistory(teamId);
    responseHandler.success(res, "Edit history fetched successfully", newsList);
  } catch (error: unknown) {
    responseHandler.error(
      res,
      500,
      error instanceof Error ? error.message : "An error occurred"
    );
  }
};
