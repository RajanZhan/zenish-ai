
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const chatWithGemini = async (prompt: string, history: any[] = []) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `你是 AI 任务编排系统的大脑。
        你的职责是与用户进行自然语言交流，解释任务状态。
        如果你认为用户想要开始一个新的复杂流程，请引导用户，并提示系统会进行“任务编排”。
        请始终使用中文回复用户。`,
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "在处理您的请求时遇到了错误，请稍后再试。";
  }
};

export const planTaskWithGemini = async (userGoal: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `用户目标: "${userGoal}"。请将此目标分解为 3-5 个具体的任务步骤。
      对于每个步骤，确定是否需要人类交互。如果需要，提供一个 UISchema。
      UISchema 应该包含 title, fields (key, label, type (text/number/select), options), 和 actions。`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            taskName: { type: Type.STRING },
            description: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  needsInteraction: { type: Type.BOOLEAN },
                  uiIntent: { type: Type.STRING, description: "FORM or NONE" },
                  uiSchema: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      fields: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            key: { type: Type.STRING },
                            label: { type: Type.STRING },
                            type: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } }
                          }
                        }
                      },
                      actions: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            type: { type: Type.STRING },
                            label: { type: Type.STRING }
                          }
                        }
                      }
                    }
                  }
                },
                required: ['name', 'needsInteraction', 'uiIntent']
              }
            }
          },
          required: ['taskName', 'description', 'steps']
        }
      }
    });
    return JSON.parse(response.text?.trim() || '{}');
  } catch (error) {
    console.error("Gemini Planning Error:", error);
    return null;
  }
};

export const getTaskDecision = async (userIntent: string) => {
  try {
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
    return JSON.parse(response.text?.trim() || '{}');
  } catch (error) {
    console.error("Gemini decision error:", error);
    return null;
  }
};
