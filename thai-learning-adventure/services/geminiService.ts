
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeneratedLessonItem, ActivityQuestion } from '../types';
import { GEMINI_TEXT_MODEL } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set. This application requires a valid Gemini API Key to function.");
  // Using a placeholder will cause API errors. User must configure their environment.
}

// Initialize AI client. If API_KEY is undefined, this will likely cause issues at runtime.
// The user is responsible for ensuring API_KEY is available in process.env.
const ai = new GoogleGenAI({ apiKey: API_KEY! }); // Use non-null assertion if confident API_KEY will be set, or handle more gracefully.

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
  if (!API_KEY) { // Check if API key is missing
     console.error("Gemini API key is not configured. Cannot generate lesson material.");
     // Return mock data or throw error. For now, returning specific mock for visibility.
     return {
        itemKey: itemKey,
        thaiScript: itemKey.startsWith('ก+') ? itemKey.split('+').join('') : (itemKey === 'อะ' ? '◌ะ' : itemKey),
        description: `คำอธิบายตัวอย่างสำหรับ ${itemKey} (API Key Missing)`,
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
   if (!API_KEY) {
    console.error("Gemini API key is not configured. Cannot generate activity question.");
    return {
      question: "คำถามตัวอย่าง (API Key Missing)",
      options: [
        { text: "คำตอบ 1 (ถูก)", correct: true },
        { text: "คำตอบ 2", correct: false },
        { text: "คำตอบ 3", correct: false },
      ],
      explanation: "นี่คือคำอธิบายเมื่อ API Key ขาดหายไป",
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
