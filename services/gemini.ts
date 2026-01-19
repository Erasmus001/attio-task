
import { GoogleGenAI, Type } from "@google/genai";
import { TaskPriority, AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const refineTask = async (title: string): Promise<AIResponse | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Refine this task: "${title}". Suggest a professional description, an appropriate priority (low, medium, or high), and break it down into 3 actionable sub-tasks.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            priority: { 
                type: Type.STRING,
                description: "Must be 'low', 'medium', or 'high'"
            },
            subTasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["description", "priority", "subTasks"]
        }
      }
    });

    if (!response.text) return null;
    const data = JSON.parse(response.text.trim());
    
    // Validate priority
    const priority = Object.values(TaskPriority).includes(data.priority as TaskPriority) 
      ? (data.priority as TaskPriority) 
      : TaskPriority.MEDIUM;

    return {
      description: data.description || "",
      priority,
      subTasks: data.subTasks || []
    };
  } catch (error) {
    console.error("AI refinement failed:", error);
    return null;
  }
};

export const generateSummary = async (title: string, description: string): Promise<string | null> => {
  try {
    const prompt = `Provide a concise, professional one-sentence executive summary for the following task.
    Title: ${title}
    Description: ${description || "No description provided."}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text?.trim() || null;
  } catch (error) {
    console.error("AI summary generation failed:", error);
    return null;
  }
};
