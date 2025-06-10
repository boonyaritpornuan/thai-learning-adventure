
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeneratedLessonItem, ActivityQuestion } from '../types';
import { GEMINI_TEXT_MODEL } from '../constants';

const API_KEY = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI with API_KEY. Check if the API key is valid. Falling back to mock data where applicable.", error);
    // ai remains null, and functions below will handle it by returning mock data.
  }
} else {
  console.warn("API_KEY environment variable is not set. The application will attempt to use mock data where available. For full functionality, please ensure a valid Gemini API_KEY is configured in your environment (process.env.API_KEY).");
}

const parseJsonResponse = <T,>(responseText: string, itemKey?: string): T | null => {
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Matches ```json ... ``` or ``` ... ```
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim(); // Extract content within fences
  }

  try {
    const parsedData = JSON.parse(jsonStr);
    // Ensure itemKey is present if provided for lesson items
    if (itemKey && typeof parsedData === 'object' && parsedData !== null) {
      (parsedData as any).itemKey = itemKey; // Ensure original itemKey is part of the object
      
      // Heuristics to ensure thaiScript is present, as Gemini might put it in 'character' or miss it.
      if (!parsedData.thaiScript && parsedData.character) {
        parsedData.thaiScript = parsedData.character;
      }
      // For vowels, ensure proper display form. e.g. 'อะ' -> '◌ะ'
      if (parsedData.itemKey && !parsedData.thaiScript && (parsedData.itemKey.includes('อะ') || parsedData.itemKey.includes('อิ') || parsedData.itemKey.includes('อุ'))) {
        const vowelMap: {[key: string]: string} = {'อะ': '◌ะ', 'อิ': '◌ิ', 'อุ': '◌ุ'};
        parsedData.thaiScript = vowelMap[parsedData.itemKey] || parsedData.itemKey;
      }
      // For combinations, ensure combinedSound is used as thaiScript if not provided.
      if (!parsedData.thaiScript && parsedData.combinedSound) {
        parsedData.thaiScript = parsedData.combinedSound;
      }
      // Fallback: if thaiScript is still missing, use the itemKey (e.g., for vocabulary words)
      if (!parsedData.thaiScript && parsedData.itemKey) {
        parsedData.thaiScript = parsedData.itemKey;
      }
    }
    return parsedData as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "\nRaw response text:", responseText, "\nOriginal itemKey (if any):", itemKey);
    return null;
  }
};

export const generateLessonMaterial = async (prompt: string, itemKey: string): Promise<GeneratedLessonItem | null> => {
  if (!ai) { // Check if AI client failed to initialize or API key was missing/invalid
     console.error("Gemini API client is not initialized (API_KEY might be missing or invalid). Using mock data for lesson material.");
     return {
        itemKey: itemKey,
        thaiScript: itemKey.startsWith('ก+') ? itemKey.split('+').join('') : (itemKey === 'อะ' ? '◌ะ' : itemKey),
        description: `คำอธิบายตัวอย่างสำหรับ ${itemKey} (API Key Missing or Invalid)`,
        exampleWord: `ตัวอย่าง${itemKey}`,
        imageSuggestion: `ภาพน่ารักสำหรับ ${itemKey}`,
        pronunciation: `เสียงอ่าน ${itemKey}`,
        ...(itemKey.includes('+') && { combinedSound: itemKey.split('+').join('') }),
     };
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4, // Slightly lower for more predictable educational content
      },
    });
    
    const text = response.text;
    if (!text) {
      console.error("No text in Gemini response for lesson material. ItemKey:", itemKey);
      return null;
    }
    return parseJsonResponse<GeneratedLessonItem>(text, itemKey);
  } catch (error) {
    console.error(`Error generating lesson material for itemKey "${itemKey}":`, error);
    return null;
  }
};

export const generateActivityQuestion = async (prompt: string): Promise<ActivityQuestion | null> => {
   if (!ai) { // Check if AI client failed to initialize or API key was missing/invalid
    console.error("Gemini API client is not initialized (API_KEY might be missing or invalid). Using mock data for activity question.");
    return {
      question: "คำถามตัวอย่าง (API Key Missing or Invalid)",
      options: [
        { text: "คำตอบ 1 (ถูก)", correct: true },
        { text: "คำตอบ 2", correct: false },
        { text: "คำตอบ 3", correct: false },
      ],
      explanation: "นี่คือคำอธิบายเมื่อ API Key ขาดหายไปหรือเกิดข้อผิดพลาดในการเริ่มต้น API",
    };
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6, // Slightly higher for more varied questions
      },
    });
    const text = response.text;
     if (!text) {
      console.error("No text in Gemini response for activity question.");
      return null;
    }
    return parseJsonResponse<ActivityQuestion>(text);
  } catch (error) {
    console.error("Error generating activity question:", error);
    return null;
  }
};
