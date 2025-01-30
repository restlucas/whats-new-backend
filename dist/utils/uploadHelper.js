"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToFirebase = void 0;
const firebase_1 = require("../config/firebase"); // A importação pode variar dependendo da sua configuração
const uploadToFirebase = (fileBuffer, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bucketFile = firebase_1.storage.file(fileName);
        // Verifica se o arquivo já existe
        const [exists] = yield bucketFile.exists();
        if (exists) {
            // Se o arquivo existe, exclui-o
            yield bucketFile.delete();
        }
        // Faz o upload do buffer para o Firebase Storage
        yield bucketFile.save(fileBuffer, {
            metadata: { contentType: "image/jpeg" }, // Altere conforme necessário
        });
        // Torna o arquivo público
        yield bucketFile.makePublic();
        // Retorna a URL pública do arquivo
        return bucketFile.publicUrl();
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error on Firebase's image upload: ${error.message}`);
        }
        else {
            throw new Error("Unknown error on upload image to Firebase");
        }
    }
});
exports.uploadToFirebase = uploadToFirebase;
