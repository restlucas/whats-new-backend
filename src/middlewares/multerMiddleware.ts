import multer from "multer";
import path from "path";

// Configuração para armazenar o arquivo temporariamente no disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "../../uploads")); // Diretório temporário
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Validações simples para tipo de arquivo
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Arquivo inválido. Apenas imagens são permitidas."));
  }
};

export const upload = multer({ storage, fileFilter });
