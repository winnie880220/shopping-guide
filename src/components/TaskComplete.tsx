import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { TASK_COMPLETE_MESSAGES } from '../study/taskConfig';
import { useStudy } from '../context/StudyContext';

const MIN_VIEW_MS = 2200;

export const TaskComplete: React.FC = () => {
  const { taskCompleteOverlay, dismissTaskComplete } = useStudy();
  const [canContinue, setCanContinue] = useState(false);

  const step = taskCompleteOverlay;
  const message = step ? TASK_COMPLETE_MESSAGES[step] : null;

  useEffect(() => {
    if (!step) return;
    setCanContinue(false);
    const timer = setTimeout(() => setCanContinue(true), MIN_VIEW_MS);
    return () => clearTimeout(timer);
  }, [step]);

  if (!step || !message) return null;

  return (
    <motion.div
      key={`complete-${step}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[210] bg-white flex flex-col max-w-md mx-auto left-0 right-0"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-8"
        >
          <CheckCircle2 size={48} className="text-green-500" />
        </motion.div>

        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-600 mb-3">
          完成
        </p>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-4 leading-snug">
          {message.title}
        </h1>
        <p className="text-[15px] text-gray-500 leading-relaxed text-center max-w-[280px]">
          {message.subtitle}
        </p>
      </div>

      <div className="px-6 pb-12 pt-4">
        <button
          onClick={dismissTaskComplete}
          disabled={!canContinue}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-[15px] active:scale-[0.98] transition-all shadow-lg shadow-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {canContinue
            ? step === 5
              ? '結束測試'
              : '繼續下一個任務'
            : '請稍候…'}
        </button>
        {!canContinue && (
          <p className="text-center text-[10px] text-gray-400 mt-3">正在確認完成狀態</p>
        )}
      </div>
    </motion.div>
  );
};
