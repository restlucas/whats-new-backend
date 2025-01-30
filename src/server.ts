import app from "./app";
import dotenv from "dotenv";

dotenv.config(); // Carrega variáveis de ambiente do .env

const PORT = Number(process.env.PORT) || 3000; // Convertendo para número
const HOST = process.env.HOST || "0.0.0.0"; // Para aceitar conexões externas

const startServer = () => {
  try {
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server is running at http://${HOST}:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1); // Encerra o processo em caso de erro crítico
  }
};

startServer();
