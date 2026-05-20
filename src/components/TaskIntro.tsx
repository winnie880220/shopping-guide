import React from 'react';
import { motion } from 'motion/react';
import { TASK_HINTS } from '../study/taskConfig';
import { useStudy } from '../context/StudyContext';

export const TaskIntro: React.FC = () => {
  const { currentStep, confirmTaskIntro } = useStudy();
  const task = TASK_HINTS[currentStep];

  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-white flex flex-col max-w-md mx-auto left-0 right-0"
    >
      <div className="flex-1 flex flex-col justify-center px-8 py-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-300 mb-6 text-center">
          步驟 {currentStep} / 5
        </p>
        <h1 className="text-[26px] font-bold text-gray-900 text-center mb-6 leading-snug">
          {task.title}
        </h1>
        <p className="text-[17px] text-gray-600 leading-relaxed text-center">
          {task.hint}
        </p>
      </div>

      <div className="px-6 pb-12 pt-4">
        <button
          onClick={confirmTaskIntro}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-[15px] active:scale-[0.98] transition-transform shadow-lg shadow-gray-200"
        >
          確認，開始此任務
        </button>
      </div>
    </motion.div>
  );
};
