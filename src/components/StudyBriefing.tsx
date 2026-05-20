import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ClipboardList, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { STUDY_BRIEFING } from '../study/taskConfig';
import { useStudy } from '../context/StudyContext';

export const StudyBriefing: React.FC = () => {
  const { confirmStudyBriefing } = useStudy();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[210] flex flex-col max-w-md mx-auto left-0 right-0 bg-gradient-to-b from-stone-100 via-white to-stone-50"
    >
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-6 pt-14 pb-6 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, type: 'spring', stiffness: 260, damping: 22 }}
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-900 flex items-center justify-center shadow-xl shadow-gray-300/40"
          >
            <ClipboardList size={28} className="text-white" strokeWidth={1.75} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[21px] font-bold text-gray-900 leading-snug tracking-tight"
          >
            {STUDY_BRIEFING.title.main}
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="w-10 h-0.5 bg-gray-300 mx-auto my-3 origin-center"
          />
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="text-[17px] font-semibold text-gray-700"
          >
            {STUDY_BRIEFING.title.sub}
          </motion.p>
        </div>

        <div className="px-5 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-100/80 shadow-[0_8px_32px_rgba(15,23,42,0.06)] p-5 sm:p-6 space-y-3.5"
          >
            {STUDY_BRIEFING.paragraphs.map((segments, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.28 + idx * 0.04 }}
                  className="text-[15px] leading-[1.75] text-left text-gray-600"
                >
                  {segments.map((segment, segIdx) => (
                    <span
                      key={segIdx}
                      className={
                        segment.semibold
                          ? 'font-semibold text-gray-900'
                          : undefined
                      }
                    >
                      {segment.text}
                    </span>
                  ))}
                </motion.p>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex flex-wrap justify-center gap-2 mt-5"
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm">
              <Clock size={12} className="text-gray-400" />
              約 10–15 分鐘
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm">
              <ShieldCheck size={12} className="text-gray-400" />
              匿名進行
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm">
              <Sparkles size={12} className="text-gray-400" />
              5 項任務
            </span>
          </motion.div>
        </div>
      </div>

      <div className="px-6 pb-10 pt-4 border-t border-gray-200/60 bg-white/80 backdrop-blur-md">
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          onClick={confirmStudyBriefing}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-gray-300/30 hover:shadow-xl hover:shadow-gray-300/40"
        >
          開始
          <ArrowRight size={18} strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  );
};
