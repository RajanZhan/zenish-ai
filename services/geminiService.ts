
import { GoogleGenAI, Type } from "@google/genai";

// Always use a named parameter for the API key from environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const chatWithGemini = async (prompt: string, history: any[] = []) => {
  try {
    // Generate content using gemini-3-flash-preview as per task complexity guidelines.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `你是 AI 任务编排系统的大脑。
        你的职责是与用户进行自然语言交流，解释任务状态，并建议高层级的决策。
        当你建议创建新任务时，请在对话中进行。
        你还应该识别用户是想开始一个新任务还是修改现有任务。
        请始终使用中文回复用户。`,
        temperature: 0.7,
      }
    });
    // Use .text property directly, not as a method.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "在处理您的请求时遇到了错误，请稍后再试。";
  }
};

export const getTaskDecision = async (userIntent: string) => {
  try {
    // Structured JSON response request with defined schema.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `用户说: "${userIntent}"。请提供一个高层级的任务决策。`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  recommended: { type: Type.BOOLEAN }
                },
                required: ['label', 'value']
              }
            }
          },
          required: ['message', 'actions']
        }
      }
    });
    // Direct access to text property and trimming for JSON parsing.
    return JSON.parse(response.text?.trim() || '{}');
  } catch (error) {
    console.error("Gemini decision error:", error);
    return null;
  }
};
