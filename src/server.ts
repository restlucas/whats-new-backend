import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

const startServer = () => {
  try {
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server is running at http://${HOST}:${PORT}/v1/api`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
};

startServer();
