
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LESSONS_CONFIG } from '../constants';
import { UserProgress, LessonProgress } from '../types';
import { loadProgress } from '../services/progressService';
import ProgressBar from '../components/ProgressBar';

const HomePage: React.FC = () => {
  const [userProgress, setUserProgress] = useState<UserProgress>(loadProgress());

  // Reload progress if user navigates back to home page, e.g. after completing a lesson
  useEffect(() => {
    const handleFocus = () => { // More reliable way to update when page becomes visible
        setUserProgress(loadProgress());
    };
    window.addEventListener('focus', handleFocus);
    // Initial load
    setUserProgress(loadProgress());
    return () => {
        window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <div className="text-center">
      <header className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-sky-700 mb-3 animate-fade-in-down">
          <i className="fas fa-book-reader mr-3 text-yellow-400"></i>ยินดีต้อนรับสู่การเรียนภาษาไทย!
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-slate-600 animate-fade-in-up">
          เลือกบทเรียนด้านล่าง แล้วเริ่มสนุกกับการผจญภัยในโลกภาษาไทยได้เลย!
        </p>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
        {LESSONS_CONFIG.map((lesson, index) => {
          const progressData: LessonProgress | undefined = userProgress[lesson.id];
          const isUnlocked = progressData ? progressData.unlocked : index === 0; // First lesson always unlocked initially
          const completedItemsCount = progressData ? progressData.completedItems.length : 0;
          const totalItemsInLesson = lesson.items.length;
          const isCompleted = progressData ? completedItemsCount >= totalItemsInLesson : false;

          return (
            <Link
              key={lesson.id}
              to={isUnlocked ? `/lesson/${lesson.id}` : '#'}
              className={`
                p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-2xl flex flex-col justify-between
                transform transition-all duration-300 ease-in-out group
                ${isUnlocked ? `${lesson.color} text-white hover:scale-105 hover:brightness-110` : 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-80'}
                ${isCompleted && isUnlocked ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-sky-50' : ''}
              `}
              aria-disabled={!isUnlocked}
            >
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <i className={`${lesson.icon} text-4xl sm:text-5xl mb-3 ${isUnlocked ? 'text-white opacity-90' : 'text-slate-400'}`}></i>
                    {isCompleted && isUnlocked && <i className="fas fa-check-circle text-2xl text-yellow-300" title="บทเรียนนี้จบแล้ว"></i>}
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-1 sm:mb-2">{lesson.title}</h2>
                <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${isUnlocked ? 'text-sky-100 opacity-90' : 'text-slate-400'}`}>{lesson.description}</p>
              </div>
              
              <div className="w-full mt-auto">
                {isUnlocked && progressData ? (
                  <>
                     <ProgressBar current={completedItemsCount} total={totalItemsInLesson} color="bg-yellow-400" height="h-2.5 sm:h-3"/>
                     <p className="text-xs sm:text-sm mt-1 opacity-80">{completedItemsCount} / {totalItemsInLesson} รายการ</p>
                  </>
                ) : !isUnlocked ? (
                  <div className="text-center">
                    <i className="fas fa-lock text-xl sm:text-2xl text-slate-400"></i>
                    <p className="text-xs sm:text-sm mt-1">ล็อกอยู่</p>
                  </div>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default HomePage;