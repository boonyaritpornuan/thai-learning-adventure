
import React from 'react';
import Button from './Button'; // Assuming Button component is in the same directory

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  details?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry, details }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 sm:p-6 rounded-md shadow-lg my-4" role="alert">
      <div className="flex">
        <div className="py-1"><i className="fas fa-exclamation-triangle text-red-500 mr-3 text-xl sm:text-2xl"></i></div>
        <div className="w-full">
          <p className="font-bold text-base sm:text-lg">โอ๊ะโอ! เกิดข้อผิดพลาด</p>
          <p className="text-sm sm:text-base">{message}</p>
          {details && <p className="text-xs sm:text-sm mt-1 text-red-600">{details}</p>}
          {onRetry && (
            <div className="mt-3 text-right">
                <Button
                onClick={onRetry}
                variant="danger"
                size="sm"
                >
                <i className="fas fa-redo mr-2"></i>
                ลองอีกครั้ง
                </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;