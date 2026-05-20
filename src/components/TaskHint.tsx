import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { TASK_HINTS } from '../study/taskConfig';
import { useStudy } from '../context/StudyContext';

export const TaskHint: React.FC = () => {
  const { currentStep, isStudyComplete } = useStudy();
  const task = TASK_HINTS[currentStep];

  if (isStudyComplete) return null;

  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1.5 rounded-full bg-amber-50 text-amber-600 flex-shrink-0">
          <Sparkles size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">
              {task.title}
            </span>
            <span className="text-[10px] font-bold text-gray-300">步驟 {currentStep}/5</span>
          </div>
          <p className="text-[13px] text-gray-700 leading-relaxed font-medium">{task.hint}</p>
        </div>
      </div>
    </motion.div>
  );
};
