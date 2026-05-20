import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  StudyAction,
  StudyTaskStep,
  TASK_HINTS,
  TASK_MATTRESS_ID,
  TASK_TABLE_ID,
  isActionAllowed,
  OFF_PATH_TOAST_VARIANTS,
} from '../study/taskConfig';

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
        const variant =
          OFF_PATH_TOAST_VARIANTS[Math.floor(Math.random() * OFF_PATH_TOAST_VARIANTS.length)];
        showToast(variant);
        return false;
      }
      onAllowed?.();
      return true;
    },
    [canAction, showToast]
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
