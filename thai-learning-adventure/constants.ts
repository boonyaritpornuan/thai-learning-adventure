
import { LessonConfig, GeneratedLessonItem } from './types';

export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';

// Helper to create JSON prompt
const createJsonPrompt = (instruction: string, keys: string[]): string => {
  return `${instruction} Please respond strictly with a JSON object. The JSON object must only contain the following keys: ${keys.join(', ')}. Ensure the response is a valid JSON.`;
};

export const LESSONS_CONFIG: LessonConfig[] = [
  {
    id: 'consonants1',
    title: 'บทที่ 1: รู้จักพยัญชนะไทย (ก-ช)',
    description: 'เรียนรู้พยัญชนะไทย 8 ตัวแรก: ก, ข, ค, ฆ, ง, จ, ฉ, ช',
    type: 'consonants',
    items: ['ก', 'ข', 'ค', 'ฆ', 'ง', 'จ', 'ฉ', 'ช'],
    color: 'bg-red-500', // Adjusted color for better contrast with white text
    icon: 'fa-solid fa-feather-pointed',
    promptTemplate: (item: string) => createJsonPrompt(
      `Generate teaching material for a 5-year-old about the Thai consonant '${item}'. Include: 1. A simple description of '${item}'. 2. An example word starting with '${item}' (1 word). 3. A description for a cute illustration related to the example word (e.g., 'A cute drawing of a chicken crowing'). 4. The phonetic sound of the consonant '${item}' (e.g., 'Gor Gai'). Ensure itemKey is '${item}' and thaiScript is '${item}'.`,
      ['itemKey', 'thaiScript', 'description', 'exampleWord', 'imageSuggestion', 'pronunciation']
    ),
    activityPromptTemplate: (item: string, generated: GeneratedLessonItem) => createJsonPrompt(
      `A 5-year-old has just learned about the consonant '${item}' and the word '${generated.exampleWord}'. Create one multiple-choice question to test their understanding. Include one correct option and two incorrect options. The question should be about '${item}' or '${generated.exampleWord}'. Provide a brief explanation for the correct answer.`,
      ['question', 'options', 'explanation']
    ),
  },
  {
    id: 'vowels1',
    title: 'บทที่ 2: รู้จักสระไทย (อะ, อิ, อุ)',
    description: 'เรียนรู้สระไทย 3 ตัวแรก: สระอะ, สระอิ, สระอุ',
    type: 'vowels',
    items: ['อะ', 'อิ', 'อุ'],
    color: 'bg-blue-500', // Adjusted color
    icon: 'fa-solid fa-water',
    promptTemplate: (item: string) => {
      const vowelMap: {[key: string]: string} = {'อะ': '◌ะ', 'อิ': '◌ิ', 'อุ': '◌ุ'};
      return createJsonPrompt(
        `Generate teaching material for a 5-year-old about the Thai vowel '${item}'. Include: 1. A simple description of the vowel '${item}'. 2. An example word containing the vowel '${item}' (1 word). 3. A description for a cute illustration related to the example word. 4. The phonetic sound of the vowel '${item}'. Ensure itemKey is '${item}' and thaiScript is '${vowelMap[item] || item}'.`,
        ['itemKey', 'thaiScript', 'description', 'exampleWord', 'imageSuggestion', 'pronunciation']
      );
    },
     activityPromptTemplate: (item: string, generated: GeneratedLessonItem) => createJsonPrompt(
      `A 5-year-old has just learned about the vowel '${item}' and the word '${generated.exampleWord}'. Create one multiple-choice question to test their understanding. Include one correct option and two incorrect options. The question should be about '${item}' or '${generated.exampleWord}'. Provide a brief explanation.`,
      ['question', 'options', 'explanation']
    ),
  },
  {
    id: 'combinations1',
    title: 'บทที่ 3: ประสมคำ (ก+สระ)',
    description: 'ฝึกประสมพยัญชนะ ก, ข, ค กับสระ อะ, อิ, อุ',
    type: 'combinations',
    items: ['ก+อะ', 'ข+อิ', 'ค+อุ'], // Represent combinations for logic
    color: 'bg-green-500', // Adjusted color
    icon: 'fa-solid fa-puzzle-piece',
    promptTemplate: (item: string) => {
      const parts = item.split('+'); // e.g. "ก" and "อะ"
      const combined = parts.join(''); // e.g. "กะ"
      return createJsonPrompt(
        `Generate teaching material for a 5-year-old about combining the Thai consonant '${parts[0]}' with the vowel '${parts[1]}'. Include: 1. The resulting combined sound/syllable. 2. A simple explanation. 3. An example word containing this combination (1 word). 4. A description for a cute illustration related to the example word. 5. The phonetic sound of the combined syllable. Ensure itemKey is '${item}' and thaiScript is '${combined}'.`,
        ['itemKey', 'thaiScript', 'combinedSound', 'description', 'exampleWord', 'imageSuggestion', 'pronunciation']
      );
    },
    activityPromptTemplate: (item: string, generated: GeneratedLessonItem) => createJsonPrompt(
      `A 5-year-old has just learned about combining to make '${generated.combinedSound || generated.thaiScript}' and the word '${generated.exampleWord}'. Create one multiple-choice question. Include one correct option and two incorrect options. The question should be about '${generated.combinedSound || generated.thaiScript}' or '${generated.exampleWord}'. Provide a brief explanation.`,
      ['question', 'options', 'explanation']
    ),
  },
  {
    id: 'vocabulary1',
    title: 'บทที่ 4: คำศัพท์พื้นฐาน (แม่, พ่อ, บ้าน)', // Corrected chapter number
    description: 'เรียนรู้คำศัพท์พื้นฐานในชีวิตประจำวัน',
    type: 'vocabulary',
    items: ['แม่', 'พ่อ', 'บ้าน'],
    color: 'bg-yellow-500', // Adjusted color
    icon: 'fa-solid fa-book-open-reader',
    promptTemplate: (item: string) => createJsonPrompt(
      `Generate teaching material for a 5-year-old about the Thai vocabulary word '${item}'. Include: 1. A simple explanation of the meaning of '${item}'. 2. A simple sentence using '${item}' (1 sentence). 3. A description for a cute illustration related to '${item}'. 4. The phonetic sound of '${item}'. Ensure itemKey is '${item}' and thaiScript is '${item}'.`,
      ['itemKey', 'thaiScript', 'description', 'sentence', 'imageSuggestion', 'pronunciation'] // Removed exampleWord as item itself is the word
    ),
    activityPromptTemplate: (item: string, generated: GeneratedLessonItem) => createJsonPrompt(
      `A 5-year-old has just learned the word '${item}' and the sentence '${generated.sentence}'. Create one multiple-choice question to test their understanding of the word '${item}'. Include one correct option and two incorrect options. Provide a brief explanation.`,
      ['question', 'options', 'explanation']
    ),
  },
];
