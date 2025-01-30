"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Carrega variáveis de ambiente do .env
const PORT = Number(process.env.PORT) || 3000; // Convertendo para número
const HOST = process.env.HOST || "0.0.0.0"; // Para aceitar conexões externas
const startServer = () => {
    try {
        app_1.default.listen(PORT, HOST, () => {
            console.log(`🚀 Server is running at http://${HOST}:${PORT}/api`);
        });
    }
    catch (error) {
        console.error("❌ Error starting server:", error);
        process.exit(1); // Encerra o processo em caso de erro crítico
    }
};
startServer();
