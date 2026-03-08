import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SearchResult } from "../types";

// Helper to get the AI client, preferring a custom key if available
const getAI = () => {
  const customKey = typeof window !== 'undefined' ? localStorage.getItem('nur_custom_api_key') : null;
  return new GoogleGenAI({ apiKey: customKey || process.env.API_KEY });
};

/**
 * Analyzes the Quran for a specific topic using Gemini 3 Pro with Thinking.
 */
export const analyzeQuranTopic = async (topic: string): Promise<SearchResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze the Holy Quran deeply for the topic: "${topic}". 
    Find the most relevant verses (Ayats) that discuss this topic. 
    Provide the Arabic text, a precise Urdu translation, and a detailed explanation in English of why this verse is relevant to the topic.
    Ensure the Arabic text includes proper diacritics (Tashkeel).`,
    config: {
      // Utilizing thinking budget for deep retrieval and connection of concepts
      thinkingConfig: { thinkingBudget: 4096 }, 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          summary: { type: Type.STRING, description: "A comprehensive summary of what the Quran says about this topic in general." },
          verses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                surahName: { type: Type.STRING },
                surahNumber: { type: Type.INTEGER },
                ayahNumber: { type: Type.INTEGER },
                arabicText: { type: Type.STRING, description: "The full Arabic text of the Ayah." },
                urduTranslation: { type: Type.STRING, description: "Urdu translation of the Ayah." },
                englishExplanation: { type: Type.STRING, description: "Detailed explanation of the verse." },
                relevanceReason: { type: Type.STRING, description: "Why this verse was chosen for the topic." },
              },
              required: ["surahName", "surahNumber", "ayahNumber", "arabicText", "urduTranslation", "englishExplanation", "relevanceReason"]
            }
          }
        },
        required: ["topic", "summary", "verses"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No response generated from Gemini.");
  }

  return JSON.parse(response.text) as SearchResult;
};

/**
 * Generates audio for a given text using Gemini TTS.
 * @param text The text to speak
 * @param language 'ar' for Arabic (Quranic style), 'ur' for Urdu
 */
export const generateSpeech = async (text: string, language: 'ar' | 'ur'): Promise<string> => {
  const ai = getAI();
  
  // Voice configuration strategy
  // Using 'Zephyr' or 'Kore' for a deeper, more serious tone suitable for Quran/Urdu
  const voiceName = language === 'ar' ? 'Kore' : 'Puck'; 
  
  // For Arabic, we want a measured pace. For Urdu, conversational but respectful.
  const prompt = language === 'ar' 
    ? `Recite the following Quranic verse with Tajweed and a beautiful, slow, melodious tone: "${text}"`
    : `Read the following Urdu translation clearly and respectfully: "${text}"`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName },
        },
      },
    },
  });

  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!audioData) {
    throw new Error("Failed to generate audio.");
  }

  return audioData;
};