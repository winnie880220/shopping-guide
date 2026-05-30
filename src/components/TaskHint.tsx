import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { TASK_HINTS } from '../study/taskConfig';
import { useStudy } from '../context/StudyContext';
import { ViewState } from '../types';
import { TaskHintText } from './TaskHintText';

interface TaskHintProps {
  /** 設為 false 時隨頁面捲動離開（用於與下方 sticky header 搭配） */
  sticky?: boolean;
  setView?: (view: ViewState) => void;
}

export const TaskHint: React.FC<TaskHintProps> = ({ sticky = true, setView }) => {
  const { currentStep, isStudyComplete, assistMessage, tryAction, canAction } = useStudy();
  const task = TASK_HINTS[currentStep];
  const showAssistNav =
    assistMessage &&
    setView &&
    currentStep === 4 &&
    canAction('nav-cart');

  if (isStudyComplete) return null;

  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 pt-3 pb-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.03)] ${
        sticky ? 'sticky top-0 z-40' : ''
      }`}
    >
      {/* 進度條 */}
      <div className="flex gap-1.5 mb-3">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              step < currentStep
                ? 'bg-amber-500'
                : step === currentStep
                  ? 'bg-amber-400'
                  : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

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
          <TaskHintText
            hint={task.hint}
            className="text-[13px] text-gray-700 leading-relaxed font-medium"
          />
          {showAssistNav && (
            <button
              type="button"
              onClick={() =>
                tryAction(
                  'nav-cart',
                  () => setView({ type: 'CART' }),
                  { entrySource: 'task_hint', buttonLabel: '任務提示-前往購物車' }
                )
              }
              className="mt-2.5 w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-xs font-bold active:scale-[0.98] transition-transform"
            >
              <span>{assistMessage}</span>
              <ChevronRight size={16} className="flex-shrink-0" />
            </button>
          )}
          {assistMessage && !showAssistNav && (
            <p className="mt-2 text-[11px] font-semibold text-amber-600/90">{assistMessage}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
