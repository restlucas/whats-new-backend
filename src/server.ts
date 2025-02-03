import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "localhost";

const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://${HOST}:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
};

startServer();
