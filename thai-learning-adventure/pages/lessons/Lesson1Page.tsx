
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LESSONS_CONFIG } from '../../constants';
import { GeneratedLessonItem, ActivityQuestion, LessonConfig, UserProgress, LessonProgress } from '../../types';
import { generateLessonMaterial, generateActivityQuestion } from '../../services/geminiService';
import { loadProgress, updateItemCompletion, updateScoreAndUnlockNext } from '../../services/progressService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';
import LessonItemDisplay from '../../components/LessonItemDisplay';
import ActivityModal from '../../components/ActivityModal';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';

const LESSON_ID = 'consonants1'; // This ID maps to the first lesson in LESSONS_CONFIG

const Lesson1Page: React.FC = () => {
  const navigate = useNavigate();
  
  const [lessonConfig, setLessonConfig] = useState<LessonConfig | null>(null);
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [currentLessonItem, setCurrentLessonItem] = useState<GeneratedLessonItem | null>(null);
  const [isLoadingItem, setIsLoadingItem] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityQuestion, setActivityQuestion] = useState<ActivityQuestion | null>(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  
  const [userProgress, setUserProgressState] = useState<UserProgress>(loadProgress());
  const [currentLessonProgress, setCurrentLessonProgress] = useState<LessonProgress | null>(null);

  useEffect(() => {
    const config = LESSONS_CONFIG.find(l => l.id === LESSON_ID);
    if (!config) {
      console.error(`Lesson config not found for ID: ${LESSON_ID}`);
      navigate('/'); 
      return;
    }
    setLessonConfig(config);

    const loadedProgress = loadProgress();
    setUserProgressState(loadedProgress);
    const progressForThisLesson = loadedProgress[config.id];

    if (!progressForThisLesson || !progressForThisLesson.unlocked) {
      console.warn(`Lesson ${LESSON_ID} is locked or progress not found. Redirecting.`);
      navigate('/'); 
      return;
    }
    
    setCurrentLessonProgress(progressForThisLesson);
    const startIndex = (progressForThisLesson.lastItemIndex < config.items.length) ? progressForThisLesson.lastItemIndex : 0;
    setCurrentItemIdx(startIndex);
    setIsLoadingItem(true); 
  }, [navigate]);

  const fetchLessonItemInternal = useCallback(async (index: number, config: LessonConfig) => {
    if (!config || index < 0 || index >= config.items.length) {
        setError(`Invalid item index (${index}) for lesson ${config?.id}.`);
        setIsLoadingItem(false);
        return;
    }
    setIsLoadingItem(true);
    setError(null);
    const itemToLearn = config.items[index];
    const itemKeyForStorage = itemToLearn;

    try {
      const prompt = config.promptTemplate(itemToLearn);
      const data = await generateLessonMaterial(prompt, itemKeyForStorage);
      if (data) {
        setCurrentLessonItem(data);
        const updatedProg = updateItemCompletion(LESSON_ID, itemKeyForStorage, index);
        setUserProgressState(updatedProg); 
        setCurrentLessonProgress(updatedProg[LESSON_ID]);
      } else {
        setError("ไม่สามารถสร้างเนื้อหาบทเรียนได้ โปรดลองอีกครั้ง หรือเนื้อหาอาจไม่ถูกต้อง");
      }
    } catch (e: any) {
      console.error("Error fetching lesson item:", e);
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูลบทเรียน: ${e.message || 'Unknown error'}`);
    } finally {
      setIsLoadingItem(false);
    }
  }, []); 

  useEffect(() => {
    if (lessonConfig && currentItemIdx >= 0 && currentItemIdx < lessonConfig.items.length) {
      fetchLessonItemInternal(currentItemIdx, lessonConfig);
    }
  }, [currentItemIdx, lessonConfig, fetchLessonItemInternal]);

  const handleNextItem = () => {
    if (lessonConfig && currentItemIdx < lessonConfig.items.length - 1) {
      setCurrentItemIdx(prev => prev + 1);
    } else {
      if (lessonConfig?.activityPromptTemplate) {
        handleOpenActivity();
      } else {
        alert("บทเรียนนี้จบแล้ว และไม่มีกิจกรรมเพิ่มเติม");
        navigateToNextOrHome();
      }
    }
  };

  const navigateToNextOrHome = () => {
    const currentLessonConfigIndex = LESSONS_CONFIG.findIndex(l => l.id === LESSON_ID);
    if (currentLessonConfigIndex !== -1 && currentLessonConfigIndex < LESSONS_CONFIG.length - 1) {
        const nextLesson = LESSONS_CONFIG[currentLessonConfigIndex + 1];
        const progress = loadProgress(); 
        if (progress[nextLesson.id]?.unlocked) {
            navigate(`/lesson/${nextLesson.id}`); // Navigate using the actual ID from config
            return;
        }
    }
    navigate('/');
  };

  const handlePrevItem = () => {
    if (currentItemIdx > 0) {
      setCurrentItemIdx(prev => prev - 1);
    }
  };

  const handleOpenActivity = async () => {
    if (!lessonConfig || !currentLessonItem || !lessonConfig.activityPromptTemplate) {
        alert("บทเรียนนี้จบแล้ว หรือยังไม่มีกิจกรรมสำหรับส่วนนี้");
        navigateToNextOrHome();
        return;
    }
    
    setIsActivityModalOpen(true);
    setIsLoadingActivity(true);
    setActivityQuestion(null); 
    try {
      const prompt = lessonConfig.activityPromptTemplate(currentLessonItem.itemKey, currentLessonItem);
      const data = await generateActivityQuestion(prompt);
      if (data) {
        setActivityQuestion(data);
      } else {
        setActivityQuestion({ question: "ไม่สามารถโหลดคำถามได้", options: [{text: "ปิด", correct:false}], explanation: "โปรดลองอีกครั้ง โปรดตรวจสอบ API Key และการเชื่อมต่อ" });
      }
    } catch (e: any) {
      console.error("Error opening activity:", e);
      setActivityQuestion({ question: "เกิดข้อผิดพลาดในการโหลดคำถาม", options: [{text: "ปิด", correct:false}], explanation: `โปรดลองอีกครั้ง: ${e.message || 'Unknown error'}` });
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const handleActivityAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      const updatedProg = updateScoreAndUnlockNext(LESSON_ID, 10); 
      setUserProgressState(updatedProg);
      setCurrentLessonProgress(updatedProg[LESSON_ID]);
    }
  };
  
  const handleCloseActivityModal = () => {
    setIsActivityModalOpen(false);
    if (lessonConfig && currentItemIdx >= lessonConfig.items.length - 1) {
        navigateToNextOrHome();
    }
  };

  if (!lessonConfig || !currentLessonProgress) {
    return <LoadingSpinner message="กำลังเตรียมบทเรียน..." size="lg" />;
  }
  
  const totalItemsInLesson = lessonConfig.items.length;
  const currentItemForDisplay = currentItemIdx + 1;

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-[calc(100vh-200px)]">
      <div className={`bg-gradient-to-br from-${lessonConfig.color.split('-')[1]}-400 to-${lessonConfig.color.split('-')[1]}-600 p-4 sm:p-6 rounded-xl shadow-lg mb-6 text-white`}>
        <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{lessonConfig.title}</h1>
            <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="!text-white hover:!bg-white/20">
                <i className="fas fa-arrow-left mr-2"></i> กลับหน้าหลัก
            </Button>
        </div>
        <p className="text-sm sm:text-base opacity-90 mb-1">{lessonConfig.description}</p>
        <p className="text-xs sm:text-sm opacity-80">รายการที่ {currentItemForDisplay > totalItemsInLesson ? totalItemsInLesson : currentItemForDisplay} จาก {totalItemsInLesson}</p>
        <ProgressBar current={currentItemForDisplay} total={totalItemsInLesson} color="bg-yellow-400" height="h-2.5"/>
      </div>

      <div className="flex-grow">
        {isLoadingItem && <LoadingSpinner message="กำลังโหลดเนื้อหา..." />}
        {error && <ErrorDisplay message={error} onRetry={() => fetchLessonItemInternal(currentItemIdx, lessonConfig)} />}
        {!isLoadingItem && !error && currentLessonItem && (
            <LessonItemDisplay item={currentLessonItem} />
        )}
      </div>

      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-lg shadow sticky bottom-4">
        <Button onClick={handlePrevItem} disabled={currentItemIdx === 0 || isLoadingItem} variant="secondary" size="md">
          <i className="fas fa-chevron-left mr-2"></i> ก่อนหน้า
        </Button>
        
        {currentItemIdx < totalItemsInLesson - 1 ? (
          <Button onClick={handleNextItem} disabled={isLoadingItem} variant="primary" size="md" className="w-full sm:w-auto">
            ถัดไป <i className="fas fa-chevron-right ml-2"></i>
          </Button>
        ) : (
          <Button 
            onClick={handleOpenActivity} 
            disabled={isLoadingItem || !lessonConfig.activityPromptTemplate} 
            variant="success" 
            size="md" 
            className="w-full sm:w-auto"
          >
            ทำกิจกรรมท้ายบท <i className="fas fa-gamepad ml-2"></i>
          </Button>
        )}
      </div>

      {lessonConfig && currentLessonItem && <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={handleCloseActivityModal}
        questionData={activityQuestion}
        isLoading={isLoadingActivity}
        onAnswer={handleActivityAnswer}
        title={`กิจกรรม: ${lessonConfig.items[currentItemIdx] || currentLessonItem.itemKey }`}
      />}
    </div>
  );
};

export default Lesson1Page;
