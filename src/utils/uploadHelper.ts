import { storage } from "../config/firebase"; // A importação pode variar dependendo da sua configuração

export const uploadToFirebase = async (
  fileBuffer: Buffer,
  fileName: string
): Promise<string> => {
  try {
    const bucketFile = storage.file(fileName);

    // Verifica se o arquivo já existe
    const [exists] = await bucketFile.exists();
    if (exists) {
      // Se o arquivo existe, exclui-o
      await bucketFile.delete();
    }

    // Faz o upload do buffer para o Firebase Storage
    await bucketFile.save(fileBuffer, {
      metadata: { contentType: "image/jpeg" }, // Altere conforme necessário
    });

    // Torna o arquivo público
    await bucketFile.makePublic();

    // Retorna a URL pública do arquivo
    return bucketFile.publicUrl();
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error on Firebase's image upload: ${error.message}`);
    } else {
      throw new Error("Unknown error on upload image to Firebase");
    }
  }
};
