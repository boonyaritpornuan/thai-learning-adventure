
import React, { useState, useEffect } from 'react';
import { ActivityQuestion } from '../types';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay'; // Added missing import

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionData: ActivityQuestion | null;
  isLoading: boolean;
  onAnswer: (isCorrect: boolean) => void;
  title?: string;
}

const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  questionData,
  isLoading,
  onAnswer,
  title = "มาทำกิจกรรมกัน!"
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  useEffect(() => {
    // Reset state when modal opens or question data changes
    if (isOpen) {
      setSelectedOption(null);
      setShowFeedback(false);
      setIsCorrectAnswer(false);
    }
  }, [isOpen, questionData]);

  if (!isOpen) return null;

  const handleOptionSelect = (optionText: string) => {
    if (showFeedback) return; // Don't allow changing answer after submission
    setSelectedOption(optionText);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || !questionData) return;
    const chosenOption = questionData.options.find(opt => opt.text === selectedOption);
    if (chosenOption) {
      const correct = chosenOption.correct;
      setIsCorrectAnswer(correct);
      setShowFeedback(true);
      // Delay calling onAnswer to show feedback and then the close button
      setTimeout(() => {
        onAnswer(correct);
        // Parent component can decide to close the modal after this,
        // or the user can click the "Next" / "Close" button.
      }, 1500); // Show feedback for 1.5 seconds before parent acts / button becomes primary focus
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-[100] transition-opacity duration-300 ease-in-out"
         aria-labelledby="activity-modal-title"
         role="dialog"
         aria-modal="true"
    >
      <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg transform transition-all scale-100 opacity-100">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 id="activity-modal-title" className="text-xl sm:text-2xl md:text-3xl font-bold text-sky-600">{title}</h2>
          {!showFeedback && ( // Only show close button if feedback is not active, user should go through feedback flow
             <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-500 hover:text-red-500">
                <i className="fas fa-times"></i>
             </Button>
          )}
        </div>

        {isLoading && <LoadingSpinner message="กำลังเตรียมคำถาม..." size="md"/>}
        
        {!isLoading && questionData && (
          <div>
            <p className="text-base sm:text-lg md:text-xl text-slate-700 mb-5 sm:mb-6">{questionData.question}</p>
            <div className="space-y-3 sm:space-y-4">
              {questionData.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option.text)}
                  disabled={showFeedback}
                  className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all duration-150
                    ${selectedOption === option.text && !showFeedback ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-500 shadow-md' : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400'}
                    ${showFeedback && option.correct ? 'bg-green-100 border-green-500 text-green-700 font-semibold' : ''}
                    ${showFeedback && selectedOption === option.text && !option.correct ? 'bg-red-100 border-red-500 text-red-700 font-semibold' : ''}
                    ${showFeedback ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                  `}
                >
                  {option.text}
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className={`mt-5 sm:mt-6 p-3 sm:p-4 rounded-md text-center text-sm sm:text-base ${isCorrectAnswer ? 'bg-green-50 text-green-700 border border-green-300' : 'bg-red-50 text-red-700 border border-red-300'}`}>
                <p className="font-semibold text-base sm:text-lg">
                  {isCorrectAnswer ? <><i className="fas fa-check-circle mr-2"></i>เยี่ยมมาก! ถูกต้องนะคร้าบ</> : <><i className="fas fa-times-circle mr-2"></i>อุ๊ปส์! ลองดูใหม่นะ</>}
                </p>
                {questionData.explanation && !isCorrectAnswer && <p className="mt-1 text-xs sm:text-sm">{questionData.explanation}</p>}
                {isCorrectAnswer && <p className="mt-1 text-xs sm:text-sm">{questionData.explanation || "เก่งมาก! ไปต่อกันเลย!"}</p>}
              </div>
            )}

            <div className="mt-6 sm:mt-8">
                {showFeedback ? (
                    <Button 
                        onClick={onClose} // This button now closes the modal after feedback
                        className="w-full"
                        size="lg"
                        variant={isCorrectAnswer ? "success" : "danger"}
                        rightIcon={isCorrectAnswer ? <i className="fas fa-arrow-right"></i> : <i className="fas fa-times"></i>}
                    >
                        {isCorrectAnswer ? "ต่อไป" : "ปิด"}
                    </Button>
                ) : (
                    <Button 
                        onClick={handleSubmitAnswer} 
                        disabled={!selectedOption || isLoading}
                        className="w-full"
                        size="lg"
                        rightIcon={<i className="fas fa-paper-plane"></i>}
                    >
                        ส่งคำตอบ
                    </Button>
                )}
            </div>
          </div>
        )}
        {!isLoading && !questionData && (
          <ErrorDisplay message="ไม่สามารถโหลดกิจกรรมได้ในขณะนี้ โปรดลองปิดและเปิดใหม่อีกครั้ง" />
        )}
      </div>
    </div>
  );
};

export default ActivityModal;