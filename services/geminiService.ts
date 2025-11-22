
import { GoogleGenAI } from "@google/genai";
import { Character, Stage } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generatePanelImage = async (
  p1: Character,
  p2: Character,
  stage: Stage,
  actionDescription: string,
  isP1Turn: boolean // To adjust perspective/focus
): Promise<string | undefined> => {
  const ai = getClient();
  if (!ai) return undefined;

  // Construct a vivid manga prompt
  const prompt = `
    Manga panel, black and white, high contrast. 
    Art Style: JoJo's Bizarre Adventure inspired, heavy ink lines, screentones (manga dots), dynamic action lines.
    Add visible manga guide lines or grid lines for artistic effect.
    Scene: ${stage.visualPrompt}.
    Characters: Player 1 is ${p1.avatarPrompt}. Player 2 is ${p2.avatarPrompt}.
    Action: ${actionDescription}.
    Ensure dramatic perspective, speed lines, and Japanese sound effect text (katakana) overlaid.
    Make it look like a professional comic book panel from a Shonen Jump manga.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // Using config suitable for images if supported, otherwise defaults
      }
    });
    
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
         if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
         }
      }
    }
    return undefined;

  } catch (error) {
    console.error("Failed to generate manga panel:", error);
    // Fallback to a placeholder if error occurs to keep game flowing
    return `https://picsum.photos/800/600?blur=2`; 
  }
};
