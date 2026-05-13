import { GoogleGenAI } from "@google/genai";
import { Challenge } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateAcademicChallenge(subject: string, difficulty: string): Promise<Challenge> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Genera un reto académico tipo trivia.
        Materia: ${subject}
        Dificultad: ${difficulty}
        Formato: JSON estrictamente con esta estructura:
        {
          "id": "string único",
          "question": "pregunta clara y educativa",
          "options": ["opción A", "opción B", "opción C", "opción D"],
          "correctAnswer": 0_al_3,
          "difficulty": "Easy" | "Medium" | "Hard",
          "subject": "${subject}"
        }
        Asegúrate de que sea educativo y veraz. Evita preguntas subjetivas.`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    const parsed = JSON.parse(text) as Challenge;
    const rewardMap: Record<string, number> = { Easy: 25, Medium: 50, Hard: 150 };
    parsed.tokenReward = rewardMap[parsed.difficulty] || 25;
    
    return parsed;
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback challenge
    return {
      id: "fallback_" + Date.now(),
      question: "¿Cuál es el planeta más grande del sistema solar?",
      options: ["Marte", "Tierra", "Júpiter", "Saturno"],
      correctAnswer: 2,
      difficulty: "Easy",
      subject: "Ciencias",
      tokenReward: 25
    };
  }
}
