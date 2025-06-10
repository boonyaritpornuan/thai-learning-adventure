
import { UserProgress, LessonProgress } from '../types';
import { LESSONS_CONFIG } from '../constants';

const PROGRESS_KEY = 'thaiLearningAdventureProgress_v1'; // Added version to allow easier schema changes later

export const loadProgress = (): UserProgress => {
  try {
    const storedProgress = localStorage.getItem(PROGRESS_KEY);
    if (storedProgress) {
      const parsedProgress = JSON.parse(storedProgress) as UserProgress;
      // Synchronize with LESSONS_CONFIG: add new lessons, update totalItems
      let updated = false;
      LESSONS_CONFIG.forEach(lesson => {
        if (!parsedProgress[lesson.id]) {
          parsedProgress[lesson.id] = {
            completedItems: [],
            score: 0,
            unlocked: lesson.id === LESSONS_CONFIG[0].id, // Unlock first lesson by default
            lastItemIndex: 0,
            totalItems: lesson.items.length,
          };
          updated = true;
        } else {
          // Ensure totalItems is up-to-date if lesson.items.length changed
          if (parsedProgress[lesson.id].totalItems !== lesson.items.length) {
            parsedProgress[lesson.id].totalItems = lesson.items.length;
            updated = true;
          }
          // Ensure first lesson is always unlocked
          if (lesson.id === LESSONS_CONFIG[0].id && !parsedProgress[lesson.id].unlocked) {
            parsedProgress[lesson.id].unlocked = true;
            updated = true;
          }
        }
      });
      if (updated) {
        saveProgress(parsedProgress); // Save if changes were made during sync
      }
      return parsedProgress;
    }
  } catch (error) {
    console.error("Failed to load progress from localStorage:", error);
  }
  // Initialize default progress if nothing stored or error
  const defaultProgress: UserProgress = {};
  LESSONS_CONFIG.forEach((lesson, index) => {
    defaultProgress[lesson.id] = {
      completedItems: [],
      score: 0,
      unlocked: index === 0, // Unlock first lesson
      lastItemIndex: 0,
      totalItems: lesson.items.length,
    };
  });
  saveProgress(defaultProgress); // Save initial default progress
  return defaultProgress;
};

export const saveProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save progress to localStorage:", error);
  }
};

export const getLessonProgress = (lessonId: string): LessonProgress | undefined => {
  const progress = loadProgress();
  return progress[lessonId];
};

export const updateItemCompletion = (lessonId: string, itemKey: string, currentItemIndex: number): UserProgress => {
  const progress = loadProgress();
  if (progress[lessonId]) {
    if (!progress[lessonId].completedItems.includes(itemKey)) {
      progress[lessonId].completedItems.push(itemKey);
    }
    // Always update lastItemIndex to the current one being viewed/completed.
    // If user goes back and forth, this reflects the furthest item they've reached in sequence.
    progress[lessonId].lastItemIndex = currentItemIndex; 
  }
  saveProgress(progress);
  return progress;
};

export const updateScoreAndUnlockNext = (lessonId: string, points: number): UserProgress => {
  const progress = loadProgress();
  if (progress[lessonId]) {
    progress[lessonId].score += points;
    
    // Unlock next lesson if current lesson is "completed"
    // Completion criteria: all items in the current lesson are in 'completedItems'
    const currentLessonConfig = LESSONS_CONFIG.find(l => l.id === lessonId);
    if (currentLessonConfig && progress[lessonId].completedItems.length >= currentLessonConfig.items.length) {
      const lessonIndex = LESSONS_CONFIG.findIndex(l => l.id === lessonId);
      if (lessonIndex !== -1 && lessonIndex < LESSONS_CONFIG.length - 1) {
        const nextLessonId = LESSONS_CONFIG[lessonIndex + 1].id;
        if (progress[nextLessonId] && !progress[nextLessonId].unlocked) {
           progress[nextLessonId].unlocked = true;
        }
      }
    }
  }
  saveProgress(progress);
  return progress;
};

export const resetProgress = (): UserProgress => {
    localStorage.removeItem(PROGRESS_KEY);
    // Return a fresh default progress state and save it
    const defaultProgress: UserProgress = {};
    LESSONS_CONFIG.forEach((lesson, index) => {
        defaultProgress[lesson.id] = {
        completedItems: [],
        score: 0,
        unlocked: index === 0,
        lastItemIndex: 0,
        totalItems: lesson.items.length,
        };
    });
    saveProgress(defaultProgress);
    return defaultProgress;
};
