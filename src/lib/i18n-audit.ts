/**
 * i18n Audit Utilities
 *
 * Sprint 11-12: Tools for auditing and improving internationalization coverage.
 *
 * This module provides:
 * 1. Common Russian UI strings centralized
 * 2. Missing translation detection helpers
 * 3. Formatting utilities for consistent text
 *
 * Usage:
 * ```tsx
 * import { UI_TEXT_RU, formatNumber, formatDate } from '@/lib/i18n-audit';
 *
 * // Use centralized strings
 * <Button>{UI_TEXT_RU.actions.save}</Button>
 *
 * // Format numbers
 * formatNumber(1234.5) // "1 234,5"
 *
 * // Format dates
 * formatDate('2026-01-15') // "15 января 2026"
 * ```
 */

// ============================================================================
// CENTRALIZED UI TEXT (RUSSIAN)
// ============================================================================

export const UI_TEXT_RU = {
  // Common actions
  actions: {
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    create: 'Создать',
    add: 'Добавить',
    remove: 'Удалить',
    close: 'Закрыть',
    confirm: 'Подтвердить',
    submit: 'Отправить',
    search: 'Поиск',
    filter: 'Фильтр',
    reset: 'Сбросить',
    refresh: 'Обновить',
    back: 'Назад',
    next: 'Далее',
    previous: 'Назад',
    finish: 'Завершить',
    continue: 'Продолжить',
    view: 'Просмотр',
    download: 'Скачать',
    upload: 'Загрузить',
    copy: 'Копировать',
    share: 'Поделиться',
    export: 'Экспорт',
    import: 'Импорт',
    select: 'Выбрать',
    selectAll: 'Выбрать все',
    deselectAll: 'Снять выбор',
    apply: 'Применить',
    clearFilters: 'Очистить фильтры',
    showMore: 'Показать ещё',
    showLess: 'Свернуть',
    expand: 'Развернуть',
    collapse: 'Свернуть',
  },

  // Common labels
  labels: {
    status: 'Статус',
    date: 'Дата',
    time: 'Время',
    name: 'Название',
    description: 'Описание',
    type: 'Тип',
    category: 'Категория',
    region: 'Регион',
    amount: 'Количество',
    total: 'Итого',
    price: 'Цена',
    volume: 'Объём',
    weight: 'Вес',
    age: 'Возраст',
    breed: 'Порода',
    grade: 'Грейд',
    notes: 'Примечания',
    comment: 'Комментарий',
    details: 'Детали',
    actions: 'Действия',
    options: 'Опции',
    settings: 'Настройки',
    profile: 'Профиль',
    notifications: 'Уведомления',
    history: 'История',
    statistics: 'Статистика',
    overview: 'Обзор',
    summary: 'Сводка',
    results: 'Результаты',
    progress: 'Прогресс',
    required: 'Обязательно',
    optional: 'Необязательно',
    new: 'Новый',
    all: 'Все',
    none: 'Нет',
    yes: 'Да',
    no: 'Нет',
    or: 'или',
    and: 'и',
    from: 'От',
    to: 'До',
    min: 'Мин',
    max: 'Макс',
  },

  // States
  states: {
    loading: 'Загрузка...',
    saving: 'Сохранение...',
    processing: 'Обработка...',
    searching: 'Поиск...',
    uploading: 'Загрузка...',
    downloading: 'Скачивание...',
    success: 'Успешно',
    error: 'Ошибка',
    warning: 'Предупреждение',
    info: 'Информация',
    pending: 'Ожидание',
    active: 'Активно',
    inactive: 'Неактивно',
    completed: 'Завершено',
    cancelled: 'Отменено',
    draft: 'Черновик',
    submitted: 'Подано',
    approved: 'Одобрено',
    rejected: 'Отклонено',
    expired: 'Истекло',
    archived: 'В архиве',
  },

  // Empty states
  empty: {
    noData: 'Нет данных',
    noResults: 'Ничего не найдено',
    noItems: 'Нет элементов',
    noBatches: 'Нет партий',
    noRequests: 'Нет заявок',
    noExecutions: 'Нет исполнений',
    noNotifications: 'Нет уведомлений',
    noMatches: 'Нет совпадений',
    noHistory: 'История пуста',
    startByAdding: 'Начните с добавления',
    tryDifferentFilters: 'Попробуйте изменить фильтры',
    tryDifferentSearch: 'Попробуйте изменить запрос',
  },

  // Errors
  errors: {
    generic: 'Произошла ошибка. Попробуйте ещё раз.',
    network: 'Ошибка сети. Проверьте подключение к интернету.',
    notFound: 'Не найдено',
    unauthorized: 'Необходима авторизация',
    forbidden: 'Доступ запрещён',
    validation: 'Проверьте правильность введённых данных',
    serverError: 'Ошибка сервера. Попробуйте позже.',
    timeout: 'Превышено время ожидания',
    fileTooLarge: 'Файл слишком большой',
    invalidFormat: 'Неверный формат',
    requiredField: 'Это поле обязательно',
    invalidEmail: 'Неверный формат email',
    invalidPhone: 'Неверный формат телефона',
    minLength: 'Минимальная длина:',
    maxLength: 'Максимальная длина:',
    minValue: 'Минимальное значение:',
    maxValue: 'Максимальное значение:',
  },

  // Confirmations
  confirmations: {
    delete: 'Вы уверены, что хотите удалить?',
    cancel: 'Вы уверены, что хотите отменить?',
    discard: 'Отменить изменения?',
    leave: 'Вы уверены, что хотите покинуть страницу? Несохранённые изменения будут потеряны.',
    submit: 'Подтвердите отправку',
    irreversible: 'Это действие нельзя отменить',
  },

  // Time periods
  time: {
    today: 'Сегодня',
    yesterday: 'Вчера',
    tomorrow: 'Завтра',
    thisWeek: 'На этой неделе',
    lastWeek: 'На прошлой неделе',
    nextWeek: 'На следующей неделе',
    thisMonth: 'В этом месяце',
    lastMonth: 'В прошлом месяце',
    nextMonth: 'В следующем месяце',
    thisYear: 'В этом году',
    lastYear: 'В прошлом году',
    allTime: 'За всё время',
    days: 'дней',
    hours: 'часов',
    minutes: 'минут',
    seconds: 'секунд',
    ago: 'назад',
    remaining: 'осталось',
  },

  // Units
  units: {
    heads: 'голов',
    headsShort: 'гол.',
    kg: 'кг',
    ton: 'т',
    tenge: '₸',
    tengePerKg: '₸/кг',
    months: 'мес.',
    weeks: 'нед.',
    days: 'дн.',
    percent: '%',
  },

  // Domain-specific (TURAN)
  domain: {
    batch: 'Партия',
    batches: 'Партии',
    poolRequest: 'Заявка на закупку',
    poolRequests: 'Заявки на закупку',
    execution: 'Исполнение',
    executions: 'Исполнения',
    farmer: 'Фермер',
    farmers: 'Фермеры',
    mpk: 'МПК',
    mpks: 'МПК',
    admin: 'Администратор',
    matching: 'Сопоставление',
    matchingWindow: 'Окно сопоставления',
    deliveryPeriod: 'Период доставки',
    premium: 'Премия',
    premiums: 'Премии',
    grading: 'Грейдинг',
    priceGrid: 'Ценовая сетка',
    marketIntent: 'Рыночное намерение',
    herdStructure: 'Структура стада',
    fillRate: 'Процент заполнения',
    matchConfidence: 'Уровень совпадения',
    standardCompliance: 'Соответствие стандарту',
  },
} as const;

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format number with Russian locale (space as thousand separator, comma as decimal)
 */
export function formatNumber(
  value: number,
  options?: {
    decimals?: number;
    showSign?: boolean;
  }
): string {
  const { decimals = 0, showSign = false } = options || {};

  const formatted = value.toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (showSign && value > 0) {
    return `+${formatted}`;
  }

  return formatted;
}

/**
 * Format currency in Kazakhstani Tenge
 */
export function formatCurrency(
  value: number,
  options?: {
    showCurrency?: boolean;
    perKg?: boolean;
  }
): string {
  const { showCurrency = true, perKg = false } = options || {};

  const formatted = formatNumber(value, { decimals: value % 1 !== 0 ? 2 : 0 });

  if (!showCurrency) return formatted;

  return perKg ? `${formatted} ₸/кг` : `${formatted} ₸`;
}

/**
 * Format date in Russian locale
 */
export function formatDate(
  date: string | Date,
  options?: {
    includeTime?: boolean;
    relative?: boolean;
    short?: boolean;
  }
): string {
  const { includeTime = false, relative = false, short = false } = options || {};

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (relative) {
    return formatRelativeDate(dateObj);
  }

  const formatOptions: Intl.DateTimeFormatOptions = short
    ? { day: 'numeric', month: 'short', year: 'numeric' }
    : { day: 'numeric', month: 'long', year: 'numeric' };

  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
  }

  return dateObj.toLocaleDateString('ru-RU', formatOptions);
}

/**
 * Format relative date (e.g., "2 дня назад")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Только что';
  if (diffMinutes < 60) return `${diffMinutes} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays === 0) return UI_TEXT_RU.time.today;
  if (diffDays === 1) return UI_TEXT_RU.time.yesterday;
  if (diffDays < 7) return `${diffDays} дн. назад`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} мес. назад`;

  return formatDate(date, { short: true });
}

/**
 * Format volume (heads of cattle)
 */
export function formatVolume(
  heads: number,
  options?: { short?: boolean }
): string {
  const { short = false } = options || {};

  if (short) {
    return `${formatNumber(heads)} гол.`;
  }

  // Proper Russian pluralization
  const lastDigit = heads % 10;
  const lastTwoDigits = heads % 100;

  let unit = 'голов';
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    unit = 'голов';
  } else if (lastDigit === 1) {
    unit = 'голова';
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    unit = 'головы';
  }

  return `${formatNumber(heads)} ${unit}`;
}

/**
 * Format weight in kilograms
 */
export function formatWeight(
  kg: number,
  options?: { short?: boolean }
): string {
  const { short = false } = options || {};

  if (kg >= 1000) {
    return `${formatNumber(kg / 1000, { decimals: 1 })} т`;
  }

  return `${formatNumber(kg)} ${short ? 'кг' : 'кг'}`;
}

/**
 * Format percentage
 */
export function formatPercent(
  value: number,
  options?: { decimals?: number; showSign?: boolean }
): string {
  const { decimals = 0, showSign = false } = options || {};

  const formatted = formatNumber(value, { decimals, showSign });
  return `${formatted}%`;
}

/**
 * Format age in months
 */
export function formatAge(months: number): string {
  if (months < 12) {
    return `${months} мес.`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return `${years} г.`;
  }

  return `${years} г. ${remainingMonths} мес.`;
}

// ============================================================================
// TYPE-SAFE TRANSLATION HELPER
// ============================================================================

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type UITextKey = NestedKeyOf<typeof UI_TEXT_RU>;

/**
 * Get UI text by dot-notation key
 */
export function getUIText(key: string): string {
  const keys = key.split('.');
  let result: unknown = UI_TEXT_RU;

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      return key; // Return key if not found
    }
  }

  return typeof result === 'string' ? result : key;
}

// ============================================================================
// AUDIT HELPERS
// ============================================================================

/**
 * Check if a string appears to be Russian text
 */
export function isRussianText(text: string): boolean {
  // Russian characters range
  const russianPattern = /[\u0400-\u04FF]/;
  return russianPattern.test(text);
}

/**
 * Check if a string appears to be a translation key
 */
export function isTranslationKey(text: string): boolean {
  // Common patterns: "word.word.word" or "WORD_WORD"
  return /^[a-z]+(\.[a-z]+)+$/i.test(text) || /^[A-Z]+(_[A-Z]+)+$/.test(text);
}

/**
 * Detect potentially hardcoded strings that should be translated
 */
export function detectHardcodedString(text: string): boolean {
  // Skip if already Russian
  if (isRussianText(text)) return false;

  // Skip if looks like a translation key
  if (isTranslationKey(text)) return false;

  // Skip very short strings (likely not user-facing)
  if (text.length < 3) return false;

  // Skip technical strings
  if (
    text.startsWith('http') ||
    text.startsWith('/') ||
    text.includes('_id') ||
    text.includes('className')
  ) {
    return false;
  }

  // Likely hardcoded if it contains uppercase letters at start (English UI text)
  if (/^[A-Z][a-z]+/.test(text)) return true;

  return false;
}
