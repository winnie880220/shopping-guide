import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  StudyAction,
  StudyTaskStep,
  TASK_HINTS,
  TASK_MATTRESS_ID,
  TASK_TABLE_ID,
  isActionAllowed,
  OFF_PATH_TOAST_VARIANTS,
} from '../study/taskConfig';
import {
  trackStudyAction,
  trackStudyOffPath,
  trackTaskComplete,
} from '../lib/analytics';

function generateParticipantId(): string {
  const stored = sessionStorage.getItem('study-participant-id');
  if (stored) return stored;
  const id = `P-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  sessionStorage.setItem('study-participant-id', id);
  return id;
}

async function logAllTasksToNotion(userId: string, durations: Record<number, number>) {
  try {
    await fetch('/api/log-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        date: new Date().toISOString().split('T')[0],
        task1_sec: durations[1] != null ? Math.round(durations[1] / 1000 * 10) / 10 : null,
        task2_sec: durations[2] != null ? Math.round(durations[2] / 1000 * 10) / 10 : null,
        task3_sec: durations[3] != null ? Math.round(durations[3] / 1000 * 10) / 10 : null,
        task4_sec: durations[4] != null ? Math.round(durations[4] / 1000 * 10) / 10 : null,
        task5_sec: durations[5] != null ? Math.round(durations[5] / 1000 * 10) / 10 : null,
      }),
    });
  } catch (err) {
    console.error('Failed to log tasks:', err);
  }
}

type ToastState = { message: string; id: number } | null;

type StudyContextValue = {
  currentStep: StudyTaskStep;
  completedSteps: Set<StudyTaskStep>;
  specsViewed: boolean;
  stockChecked: boolean;
  deliverySelected: boolean;
  cartDeliveryMethod: 'HOME' | 'STORE' | null;
  setCartDeliveryMethod: (method: 'HOME' | 'STORE' | null) => void;
  assistMessage: string | null;
  toast: ToastState;
  taskCompleteOverlay: StudyTaskStep | null;
  canAction: (action: StudyAction) => boolean;
  tryAction: (action: StudyAction, onAllowed?: () => void) => boolean;
  showToast: (message: string) => void;
  completeTask: (step: StudyTaskStep, afterNextIntro?: () => void) => void;
  completeTaskWithFeedback: (
    step: StudyTaskStep,
    message: string,
    afterNextIntro?: () => void
  ) => void;
  dismissTaskComplete: () => void;
  markSpecsViewed: () => void;
  markStockChecked: () => void;
  markDeliverySelected: () => void;
  setAssistMessage: (msg: string | null) => void;
  isStudyComplete: boolean;
  isStudyBriefingVisible: boolean;
  isTaskIntroVisible: boolean;
  confirmStudyBriefing: () => void;
  confirmTaskIntro: () => void;
};

const FEEDBACK_BEFORE_COMPLETE_MS = 1800;

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<StudyTaskStep>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<StudyTaskStep>>(new Set());
  const [specsViewed, setSpecsViewed] = useState(false);
  const [stockChecked, setStockChecked] = useState(false);
  const [deliverySelected, setDeliverySelected] = useState(false);
  const [cartDeliveryMethod, setCartDeliveryMethod] = useState<'HOME' | 'STORE' | null>(null);
  const [assistMessage, setAssistMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [briefingConfirmed, setBriefingConfirmed] = useState(false);
  const [introConfirmedSteps, setIntroConfirmedSteps] = useState<Set<StudyTaskStep>>(new Set());
  const [taskCompleteOverlay, setTaskCompleteOverlay] = useState<StudyTaskStep | null>(null);
  const afterNextIntroRef = useRef<(() => void) | null>(null);
  const taskStartTimeRef = useRef<number | null>(null);
  const taskDurationsRef = useRef<Record<number, number>>({});
  const participantIdRef = useRef<string>('');

  useEffect(() => {
    participantIdRef.current = generateParticipantId();
  }, []);

  const isStudyComplete = completedSteps.has(5);
  const isStudyBriefingVisible =
    !taskCompleteOverlay && !isStudyComplete && !briefingConfirmed;
  const isTaskIntroVisible =
    !taskCompleteOverlay &&
    !isStudyComplete &&
    briefingConfirmed &&
    !introConfirmedSteps.has(currentStep);

  const confirmStudyBriefing = useCallback(() => {
    setBriefingConfirmed(true);
  }, []);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToast({ message, id });
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 3200);
  }, []);

  const advanceStep = useCallback((step: StudyTaskStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
    const next = Math.min(5, step + 1) as StudyTaskStep;
    if (step < 5) {
      setCurrentStep(next);
      setAssistMessage(TASK_HINTS[next].assist ?? null);
      if (next === 3) {
        setSpecsViewed(false);
        setStockChecked(false);
      }
    } else {
      setCurrentStep(5);
      setAssistMessage('所有任務均已完成，感謝您的參與。');
    }
  }, []);

  const completeTask = useCallback((step: StudyTaskStep, afterNextIntro?: () => void) => {
    let durationSec = 0;
    if (taskStartTimeRef.current) {
      const durationMs = Date.now() - taskStartTimeRef.current;
      taskDurationsRef.current[step] = durationMs;
      durationSec = durationMs / 1000;
      taskStartTimeRef.current = null;
    }
    trackTaskComplete(step, durationSec);
    if (step === 5) {
      logAllTasksToNotion(participantIdRef.current, taskDurationsRef.current);
    }
    setTaskCompleteOverlay(step);
    afterNextIntroRef.current = afterNextIntro ?? null;
  }, []);

  const completeTaskWithFeedback = useCallback(
    (step: StudyTaskStep, message: string, afterNextIntro?: () => void) => {
      showToast(message);
      setTimeout(() => {
        completeTask(step, afterNextIntro);
      }, FEEDBACK_BEFORE_COMPLETE_MS);
    },
    [showToast, completeTask]
  );

  const dismissTaskComplete = useCallback(() => {
    if (!taskCompleteOverlay) return;
    const finishedStep = taskCompleteOverlay;
    setTaskCompleteOverlay(null);
    advanceStep(finishedStep);
    if (finishedStep === 5) {
      setIntroConfirmedSteps(prev => new Set([...prev, 5]));
    }
  }, [taskCompleteOverlay, advanceStep]);

  const confirmTaskIntro = useCallback(() => {
    setIntroConfirmedSteps(prev => new Set([...prev, currentStep]));
    taskStartTimeRef.current = Date.now();
    const cb = afterNextIntroRef.current;
    afterNextIntroRef.current = null;
    if (cb) {
      setTimeout(cb, 300);
    }
  }, [currentStep]);

  const markSpecsViewed = useCallback(() => {
    setSpecsViewed(true);
  }, []);

  const markStockChecked = useCallback(() => {
    setStockChecked(true);
  }, []);

  const markDeliverySelected = useCallback(() => {
    setDeliverySelected(true);
    setCartDeliveryMethod('HOME');
  }, []);

  const canAction = useCallback(
    (action: StudyAction) => {
      if (taskCompleteOverlay || isStudyBriefingVisible || isTaskIntroVisible) return false;
      return isActionAllowed(currentStep, action);
    },
    [currentStep, isStudyBriefingVisible, isTaskIntroVisible, taskCompleteOverlay]
  );

  const tryAction = useCallback(
    (action: StudyAction, onAllowed?: () => void) => {
      if (!canAction(action)) {
        trackStudyOffPath(action, currentStep);
        const variant =
          OFF_PATH_TOAST_VARIANTS[Math.floor(Math.random() * OFF_PATH_TOAST_VARIANTS.length)];
        showToast(variant);
        return false;
      }
      trackStudyAction(action, currentStep);
      onAllowed?.();
      return true;
    },
    [canAction, currentStep, showToast]
  );

  const value = useMemo(
    () => ({
      currentStep,
      completedSteps,
      specsViewed,
      stockChecked,
      deliverySelected,
      cartDeliveryMethod,
      setCartDeliveryMethod,
      assistMessage,
      toast,
      taskCompleteOverlay,
      canAction,
      tryAction,
      showToast,
      completeTask,
      completeTaskWithFeedback,
      dismissTaskComplete,
      markSpecsViewed,
      markStockChecked,
      markDeliverySelected,
      setAssistMessage,
      isStudyComplete,
      isStudyBriefingVisible,
      isTaskIntroVisible,
      confirmStudyBriefing,
      confirmTaskIntro,
    }),
    [
      currentStep,
      completedSteps,
      specsViewed,
      stockChecked,
      deliverySelected,
      cartDeliveryMethod,
      setCartDeliveryMethod,
      assistMessage,
      toast,
      taskCompleteOverlay,
      canAction,
      tryAction,
      showToast,
      completeTask,
      completeTaskWithFeedback,
      dismissTaskComplete,
      markSpecsViewed,
      markStockChecked,
      markDeliverySelected,
      isStudyComplete,
      isStudyBriefingVisible,
      isTaskIntroVisible,
      confirmStudyBriefing,
      confirmTaskIntro,
    ]
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy must be used within StudyProvider');
  return ctx;
}

export { TASK_MATTRESS_ID, TASK_TABLE_ID };
