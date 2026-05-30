import type { StudyTaskStep } from '../study/taskConfig';

export type StudyActionMeta = {
  entrySource?: string;
  buttonLabel?: string;
};

type Task1AddSource = 'search_list' | 'browse_list' | 'product_detail';
type Task2EntrySource = 'home_category' | 'category_list_card' | 'category_list_room_filter';
type Task4CartEntry = 'nav_cart_tab' | 'task_hint';
type Task5CartEntry = 'checkout_back' | 'nav_cart_tab';

type JourneyState = {
  pagePaths: string[];
  allowedActions: string[];
  offPathButtons: string[];
  task1UsedFilter: boolean;
  task1AddSource: Task1AddSource | null;
  task2EntrySource: Task2EntrySource | null;
  task3ActionOrder: string[];
  task4ActionOrder: string[];
  task4CartEntry: Task4CartEntry | null;
  task5CartEntry: Task5CartEntry | null;
};

function emptyJourney(): JourneyState {
  return {
    pagePaths: [],
    allowedActions: [],
    offPathButtons: [],
    task1UsedFilter: false,
    task1AddSource: null,
    task2EntrySource: null,
    task3ActionOrder: [],
    task4ActionOrder: [],
    task4CartEntry: null,
    task5CartEntry: null,
  };
}

let journey = emptyJourney();

export function resetJourneyForTask(_step: StudyTaskStep) {
  journey = emptyJourney();
}

export function recordJourneyPagePath(path: string) {
  if (!path) return;
  const last = journey.pagePaths[journey.pagePaths.length - 1];
  if (last !== path) journey.pagePaths.push(path);
}

export function recordTask1FilterUsed() {
  journey.task1UsedFilter = true;
}

export function recordJourneyAction(
  step: StudyTaskStep,
  action: string,
  allowed: boolean,
  meta?: StudyActionMeta
) {
  const buttonLabel = meta?.buttonLabel?.trim();

  if (allowed) {
    journey.allowedActions.push(action);
    applyTaskSpecificAllowed(step, action, meta);
  } else if (buttonLabel) {
    journey.offPathButtons.push(buttonLabel);
  } else {
    journey.offPathButtons.push(action);
  }
}

function applyTaskSpecificAllowed(step: StudyTaskStep, action: string, meta?: StudyActionMeta) {
  const entry = meta?.entrySource;

  if (step === 1 && action === 'add-mattress-to-cart' && entry) {
    journey.task1AddSource = entry as Task1AddSource;
  }

  if (step === 2 && action === 'open-coffee-tables' && entry) {
    journey.task2EntrySource = entry as Task2EntrySource;
  }

  if (step === 3 && ['view-specs', 'check-stock'].includes(action)) {
    if (!journey.task3ActionOrder.includes(action)) {
      journey.task3ActionOrder.push(action);
    }
  }

  if (step === 4 && action === 'add-table-to-cart') {
    if (!journey.task4ActionOrder.includes(action)) {
      journey.task4ActionOrder.push(action);
    }
  }

  if (step === 4 && action === 'nav-cart' && !journey.task4CartEntry && entry) {
    journey.task4CartEntry = entry as Task4CartEntry;
  }

  if (step === 5) {
    if (action === 'back-cart' && !journey.task5CartEntry) {
      journey.task5CartEntry = 'checkout_back';
    } else if (action === 'nav-cart' && !journey.task5CartEntry && entry === 'nav_cart_tab') {
      journey.task5CartEntry = 'nav_cart_tab';
    }
  }
}

function buildCompletionRoute(): string {
  const pages = journey.pagePaths.join('→');
  const actions = journey.allowedActions.join('→');
  if (pages && actions) return `${pages}|${actions}`;
  return pages || actions || 'unknown';
}

function computeEntrySource(step: StudyTaskStep): string {
  switch (step) {
    case 1: {
      const addSource = journey.task1AddSource ?? 'unknown';
      const filterFlag = journey.task1UsedFilter ? 'filter_used' : 'filter_not_used';
      return `${addSource};${filterFlag}`;
    }
    case 2:
      return journey.task2EntrySource ?? 'unknown';
    case 3:
      return journey.task3ActionOrder.length > 0
        ? journey.task3ActionOrder.join('→')
        : 'unknown';
    case 4: {
      const parts: string[] = [];
      if (journey.task4ActionOrder.length > 0) {
        parts.push(journey.task4ActionOrder.join('→'));
      }
      if (journey.task4CartEntry) parts.push(journey.task4CartEntry);
      return parts.length > 0 ? parts.join(';') : 'unknown';
    }
    case 5:
      return journey.task5CartEntry ?? 'unknown';
    default:
      return 'unknown';
  }
}

export function getTaskCompletionSnapshot(step: StudyTaskStep) {
  return {
    entry_source: computeEntrySource(step),
    completion_route: buildCompletionRoute(),
    ...(journey.offPathButtons.length > 0
      ? { off_path_buttons: journey.offPathButtons.join(',') }
      : {}),
    ...(step === 1 ? { used_filter: journey.task1UsedFilter ? 'true' : 'false' } : {}),
    ...(step === 3 && journey.task3ActionOrder.length > 0
      ? { action_sequence: journey.task3ActionOrder.join('→') }
      : {}),
  };
}
