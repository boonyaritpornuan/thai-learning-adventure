
import React, { useState, useEffect } from 'react';
import { UserProgress, LessonProgress } from '../types';
import { loadProgress, resetProgress } from '../services/progressService';
import { LESSONS_CONFIG } from '../constants';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const [userProgress, setUserProgress] = useState<UserProgress>(loadProgress());
  const navigate = useNavigate();

  useEffect(() => {
    // Keep progress up to date if user navigates away and back
    const handleFocus = () => setUserProgress(loadProgress());
    window.addEventListener('focus', handleFocus);
    setUserProgress(loadProgress()); // Initial load
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleResetProgress = () => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตความคืบหน้าทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
        const newProgress = resetProgress();
        setUserProgress(newProgress);
        // Optionally navigate to home page after reset
        // navigate('/'); 
        alert("รีเซ็ตความคืบหน้าเรียบร้อยแล้ว!");
    }
  };

  const overallProgress = LESSONS_CONFIG.reduce(
    (acc, lesson) => {
      const progress = userProgress[lesson.id];
      if (progress) {
        acc.completed += progress.completedItems.length;
        acc.total += progress.totalItems; // Use totalItems from progress which is synced with config
        acc.score += progress.score;
      } else {
        // This case should ideally not happen if loadProgress initializes correctly
        acc.total += lesson.items.length;
      }
      return acc;
    },
    { completed: 0, total: 0, score: 0 }
  );
  
  const totalLessons = LESSONS_CONFIG.length;
  const completedLessons = LESSONS_CONFIG.filter(lesson => {
    const progress = userProgress[lesson.id];
    return progress && progress.completedItems.length >= progress.totalItems && progress.totalItems > 0;
  }).length;

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-0">
      <div className="bg-gradient-to-br from-sky-500 to-cyan-500 p-6 sm:p-8 rounded-xl shadow-xl text-white mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-6">
            <i className="fas fa-user-astronaut text-6xl sm:text-7xl mb-4 sm:mb-0 p-3 bg-white/20 rounded-full"></i>
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-1 text-center sm:text-left">โปรไฟล์การเรียนรู้</h1>
                <p className="text-sky-100 mb-4 text-center sm:text-left">ภาพรวมความก้าวหน้าและคะแนนสะสมของคุณ</p>
            </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-8">
        <h2 className="text-2xl font-semibold text-sky-700 mb-4 text-center sm:text-left">ภาพรวมความสำเร็จ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-sky-50 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-sky-600 mb-2 flex items-center">
                    <i className="fas fa-tasks mr-2 text-yellow-500"></i>ความคืบหน้ารวมทุกบทเรียน
                </h3>
                <ProgressBar current={overallProgress.completed} total={overallProgress.total || 1} color="bg-green-500" height="h-5"/>
                <p className="text-sm text-slate-600 mt-1">{overallProgress.completed} / {overallProgress.total} รายการที่เรียนรู้แล้ว</p>
            </div>
            <div className="bg-sky-50 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-sky-600 mb-2 flex items-center">
                    <i className="fas fa-trophy mr-2 text-yellow-500"></i>บทเรียนที่สำเร็จแล้ว
                </h3>
                <ProgressBar current={completedLessons} total={totalLessons || 1} color="bg-purple-500" height="h-5"/>
                <p className="text-sm text-slate-600 mt-1">{completedLessons} / {totalLessons} บทเรียน</p>
            </div>
        </div>
        <p className="text-2xl font-bold text-yellow-600 mt-6 text-center">
            <i className="fas fa-star mr-2"></i>คะแนนรวม: {overallProgress.score} คะแนน
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-sky-700 mb-4 text-center sm:text-left">รายละเอียดแต่ละบทเรียน:</h2>
        <div className="space-y-4">
          {LESSONS_CONFIG.map(lesson => {
            const progress: LessonProgress | undefined = userProgress[lesson.id];
            // If progress doesn't exist, it implies it hasn't been started or synced, treat as locked.
            // loadProgress should initialize all lessons, so this should be rare.
            const isEffectivelyUnlocked = progress ? progress.unlocked : lesson.id === LESSONS_CONFIG[0].id;
            const lessonColorClass = lesson.color.replace('bg-', 'text-'); // e.g. text-red-500

            return (
              <div key={lesson.id} className={`p-4 rounded-lg shadow-md transition-all ${isEffectivelyUnlocked ? 'bg-white hover:shadow-lg' : 'bg-slate-100 opacity-70'}`}>
                <div className="flex justify-between items-center">
                    <h3 className={`font-semibold text-lg mb-1 ${isEffectivelyUnlocked ? lessonColorClass : 'text-slate-500'}`}>
                        <i className={`${lesson.icon} mr-2 opacity-80`}></i>{lesson.title}
                    </h3>
                    {progress && progress.completedItems.length >= progress.totalItems && progress.totalItems > 0 && isEffectivelyUnlocked && (
                        <i className="fas fa-check-circle text-green-500 text-xl" title="สำเร็จแล้ว"></i>
                    )}
                </div>
                {isEffectivelyUnlocked && progress ? (
                  <>
                    <ProgressBar current={progress.completedItems.length} total={progress.totalItems || 1} color={lesson.color} />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>{progress.completedItems.length} / {progress.totalItems} รายการ</span>
                      <span>คะแนน: {progress.score}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center text-sm text-slate-400">
                    <i className="fas fa-lock mr-2"></i> <span>ล็อกอยู่ (ต้องผ่านบทเรียนก่อนหน้า)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
        <div className="mt-10 pt-6 border-t border-slate-200 text-center">
            <Button onClick={handleResetProgress} variant="danger" size="lg">
                <i className="fas fa-trash-alt mr-2"></i> รีเซ็ตความคืบหน้าทั้งหมด
            </Button>
            <p className="text-xs text-slate-500 mt-2">การดำเนินการนี้จะลบข้อมูลการเรียนรู้และคะแนนทั้งหมดของคุณ</p>
        </div>
    </div>
  );
};

export default ProfilePage;