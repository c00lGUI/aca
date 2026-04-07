import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface FilePart {
  mimeType: string;
  data: string;
}

export const studyAssistant = async (
  prompt: string, 
  history: { role: string; parts: string; files?: FilePart[] }[] = [],
  currentFiles: FilePart[] = [],
  modelName: string = "gemini-3-flash-preview"
) => {
  try {
    const userParts: any[] = [{ text: prompt }];
    
    // Add current files to the user message
    currentFiles.forEach(file => {
      userParts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data
        }
      });
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        ...history.map(h => {
          const parts: any[] = [{ text: h.parts }];
          if (h.files) {
            h.files.forEach(f => {
              parts.push({
                inlineData: {
                  mimeType: f.mimeType,
                  data: f.data
                }
              });
            });
          }
          return { role: h.role, parts };
        }),
        { role: "user", parts: userParts }
      ],
      tools: [{ googleSearch: {} }],
      config: {
        systemInstruction: "You are Koroli AI, a world-class study and medical assistant. Your goal is to help students with homework, programming, academic concepts, and medical inquiries. You have advanced research capabilities and can provide up-to-date information. When discussing medical topics, provide accurate, evidence-based information but always include a disclaimer that you are an AI and not a doctor. Be encouraging, clear, and provide step-by-step explanations. For programming, provide clean, well-commented code snippets. Use markdown for formatting. You can also provide image URLs from the web when relevant to help visualize concepts. You Are Made By Louis Koroli",
        temperature: 0.7,
      },
    } as any);
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error 769";
  }
};
