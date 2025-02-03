import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const startServer = () => {
  try {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running at http://0.0.0.0:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
};

startServer();
