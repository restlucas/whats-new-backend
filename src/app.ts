import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes";

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.VERCEL_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api", router);

export default app;
