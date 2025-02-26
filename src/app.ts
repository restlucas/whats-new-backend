import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes";

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.WHATSNEW_FRONTEND_URL?.replace(/\/$/, "") || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/v1/api", router);

export default app;
