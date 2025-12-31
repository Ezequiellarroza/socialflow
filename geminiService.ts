
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateCaption = async (topic: string, format: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Genera un pie de foto (caption) creativo y atractivo para redes sociales sobre el siguiente tema: "${topic}". El formato de la publicación es ${format}. Incluye un tono profesional pero cercano, emojis pertinentes y una llamada a la acción clara.`
  });
  return response.text;
};

export const suggestHashtags = async (content: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Basado en el siguiente contenido: "${content}", sugiere una lista de 10 hashtags relevantes que ayuden al alcance orgánico. Devuelve solo los hashtags separados por espacios.`
  });
  return response.text;
};
