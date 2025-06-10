
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  color?: string; // Tailwind background color class e.g. bg-green-500
  height?: string; // Tailwind height class e.g. h-4
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, color = 'bg-sky-500', height = 'h-3 sm:h-4' }) => {
  const percentage = total > 0 ? Math.max(0, Math.min(100, Math.round((current / total) * 100))) : 0;

  return (
    <div className={`w-full bg-slate-200 rounded-full ${height} my-1 sm:my-2 shadow-inner overflow-hidden`}>
      <div
        className={`${color} ${height} rounded-full text-xs text-white flex items-center justify-end pr-2 transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
       {percentage > 15 && <span className="font-medium text-[10px] sm:text-xs">{`${percentage}%`}</span>}
      </div>
    </div>
  );
};

export default ProgressBar;