import React from 'react';
import type { BriefingSegment } from '../study/taskConfig';

export const HIGHLIGHT_MARK_CLASS =
  'box-decoration-clone shadow-[inset_0_-0.38em_0_rgba(255,218,26,0.55)]';

interface TaskHintTextProps {
  hint: string | BriefingSegment[];
  className?: string;
}

export const TaskHintText: React.FC<TaskHintTextProps> = ({ hint, className = '' }) => {
  if (typeof hint === 'string') {
    return <p className={className}>{hint}</p>;
  }

  return (
    <p className={className}>
      {hint.map((segment, index) =>
        segment.highlight ? (
          <span key={index} className={HIGHLIGHT_MARK_CLASS}>
            {segment.text}
          </span>
        ) : segment.semibold ? (
          <span key={index} className="font-semibold text-gray-900">
            {segment.text}
          </span>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      )}
    </p>
  );
};
