import React from 'react';
import { StudyAction } from '../study/taskConfig';
import { useStudy, type StudyActionMeta } from '../context/StudyContext';

interface GuardedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  action: StudyAction;
  onAllowedClick?: () => void;
  actionMeta?: StudyActionMeta;
  children: React.ReactNode;
}

export const GuardedButton: React.FC<GuardedButtonProps> = ({
  action,
  onAllowedClick,
  actionMeta,
  onClick,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  const { tryAction } = useStudy();

  return (
    <button
      {...rest}
      disabled={disabled}
      className={`${className} ${disabled ? '' : 'cursor-pointer'}`}
      onClick={(e) => {
        if (disabled) return;
        const allowed = tryAction(action, () => {
          onAllowedClick?.();
          onClick?.(e);
        }, actionMeta);
        if (!allowed) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {children}
    </button>
  );
};

interface GuardedDivProps {
  action: StudyAction;
  onAllowedClick?: () => void;
  onClick?: () => void;
  actionMeta?: StudyActionMeta;
  children: React.ReactNode;
  className?: string;
}

export const GuardedDiv: React.FC<GuardedDivProps> = ({
  action,
  onAllowedClick,
  onClick,
  actionMeta,
  children,
  className = '',
}) => {
  const { tryAction } = useStudy();

  return (
    <div
      className={className}
      onClick={() => {
        tryAction(action, () => {
          onAllowedClick?.();
          onClick?.();
        }, actionMeta);
      }}
    >
      {children}
    </div>
  );
};
