
export interface LessonConfig {
  id: string;
  title: string;
  description: string;
  type: 'consonants' | 'vowels' | 'combinations' | 'vocabulary' | 'sentences';
  items: string[]; // e.g., ['ก', 'ข', 'ค'] or ['แม่', 'พ่อ']
  color: string; // Tailwind color class e.g. bg-blue-500
  icon: string; // Font Awesome icon class e.g. fa-solid fa-cat
  promptTemplate: (item: string) => string;
  activityPromptTemplate?: (item: string, generatedContent: GeneratedLessonItem) => string;
}

export interface GeneratedLessonItem {
  itemKey: string; // The item being taught, e.g., 'ก' or 'แม่'
  character?: string; // For consonants/vowels
  description?: string;
  exampleWord?: string;
  imageSuggestion?: string; // A descriptive suggestion for an image
  pronunciation?: string; // Text representation of pronunciation
  combinedSound?: string; // For combined consonant/vowel
  sentence?: string; // For sentence lessons
  thaiScript?: string; // The primary Thai script element (e.g. ก, -ะ, กะ, แม่)
}

export interface ActivityQuestion {
  question: string;
  options: { text: string; correct: boolean }[];
  explanation?: string;
}

export interface LessonProgress {
  completedItems: string[];
  score: number;
  unlocked: boolean;
  lastItemIndex: number;
  totalItems: number;
}

export interface UserProgress {
  [lessonId: string]: LessonProgress;
}

export enum GameType {
  MultipleChoice = 'MultipleChoice',
  Matching = 'Matching',
  // Add more game types as needed
}