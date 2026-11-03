import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// Validar que la API Key exista en el archivo .env
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === "AIzaSyTuClaveAquiDeGoogleAIStudio") {
  console.error("\x1b[31m✖ [ERROR] GEMINI_API_KEY no encontrada o no configurada en el archivo .env\x1b[0m");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function main() {
  console.log("\n⏳ Conectando con Google AI Studio...");

  try {
    const prompt = "Genera un mensaje de bienvenida de 1 frase corta, motivadora y creativa para un estudiante que inicia su camino como builder en Vibecode Lab.";
    const result = await model.generateContent(prompt);
    
    console.log("\n\x1b[32m✔ [CONEXIÓN EXITOSA]\x1b[0m");
    console.log("\x1b[36m🤖 Gemini dice:\x1b[0m");
    console.log(result.response.text());
  } catch (error) {
    console.error("\n\x1b[31m✖ [ERROR AL COMUNICAR CON GEMINI]:\x1b[0m", error.message);
  }
}

main();
