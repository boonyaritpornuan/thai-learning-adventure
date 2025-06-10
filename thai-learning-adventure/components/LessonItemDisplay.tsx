
import React from 'react';
import { GeneratedLessonItem } from '../types';
import ThaiCharacterDisplay from './ThaiCharacterDisplay';

interface LessonItemDisplayProps {
  item: GeneratedLessonItem;
}

const LessonItemDisplay: React.FC<LessonItemDisplayProps> = ({ item }) => {
  // Use a combination of item details for a more unique seed for picsum.photos
  const imageSeedInput = `${item.itemKey}-${item.exampleWord || ''}-${item.imageSuggestion || 'thai-learn'}`;
  let hash = 0;
  for (let i = 0; i < imageSeedInput.length; i++) {
    const char = imageSeedInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const picSumSeed = Math.abs(hash % 1084); // Picsum has specific seed ranges, 1084 is a common max used

  return (
    <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl shadow-xl text-center transform transition-all hover:shadow-2xl duration-300">
      {item.thaiScript && <ThaiCharacterDisplay character={item.thaiScript} size="large" />}
      
      {item.description && (
        <p className="text-slate-700 mt-3 sm:mt-4 text-base sm:text-lg md:text-xl">{item.description}</p>
      )}
      
      {item.exampleWord && (
        <p className="mt-2 sm:mt-3 text-lg sm:text-xl md:text-2xl font-semibold">
          ตัวอย่าง: <span className="text-green-600">{item.exampleWord}</span>
        </p>
      )}

      {item.combinedSound && (
         <p className="mt-2 sm:mt-3 text-lg sm:text-xl md:text-2xl font-semibold">
          เสียงประสม: <span className="text-purple-600">{item.combinedSound}</span>
        </p>
      )}
      
      {item.sentence && (
        <p className="mt-2 sm:mt-3 text-base sm:text-lg md:text-xl italic text-slate-600">"{item.sentence}"</p>
      )}

      {item.pronunciation && (
        <div className="mt-3 sm:mt-4">
            <button 
                onClick={() => {
                    try {
                        const utterance = new SpeechSynthesisUtterance(item.thaiScript || item.pronunciation || item.exampleWord || item.itemKey);
                        utterance.lang = 'th-TH';
                        speechSynthesis.speak(utterance);
                    } catch (e) {
                        console.error("Speech synthesis not supported or failed.", e);
                        alert("ขออภัย ระบบเสียงไม่พร้อมใช้งานบนเบราว์เซอร์นี้");
                    }
                }}
                className="text-orange-600 hover:text-orange-700 bg-orange-100 hover:bg-orange-200 px-4 py-2 rounded-lg transition-colors text-sm sm:text-base md:text-lg"
                title="ฟังเสียง"
            >
                <i className="fas fa-volume-up mr-2"></i>{item.pronunciation}
            </button>
        </div>
      )}
      
      {item.imageSuggestion && (
        <div className="mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-slate-500 mb-1 sm:mb-2">(ภาพตัวอย่างสำหรับ: {item.imageSuggestion})</p>
          <img 
            src={`https://picsum.photos/seed/${picSumSeed}/400/300?grayscale&blur=1`} // Added grayscale and blur for variety
            alt={item.imageSuggestion} 
            className="mx-auto rounded-lg shadow-md object-cover w-full max-w-xs sm:max-w-sm h-40 sm:h-48 md:h-64 border-4 border-white"
          />
        </div>
      )}
    </div>
  );
};

export default LessonItemDisplay;