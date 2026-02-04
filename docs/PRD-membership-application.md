# PRD: Страница подачи заявки на членство в Ассоциации ТУРАН

## 1. Обзор

### 1.1 Цель
Создать публичную страницу, где фермеры могут ознакомиться с преимуществами членства в Ассоциации ТУРАН и подать заявку на вступление.

### 1.2 Целевая аудитория
- Фермеры Казахстана, занимающиеся животноводством
- Потенциальные участники пула стандартизированных продаж скота

### 1.3 Бизнес-цели
- Увеличить количество членов ассоциации
- Обеспечить прозрачный и понятный процесс вступления
- Собирать качественные заявки с полной информацией о фермерском хозяйстве

---

## 2. User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MEMBERSHIP LANDING PAGE                       │
│                    /membership или /join                         │
├─────────────────────────────────────────────────────────────────┤
│  1. Hero секция с ценностным предложением                       │
│  2. Преимущества членства (карточки)                            │
│  3. Как это работает (шаги)                                     │
│  4. FAQ секция                                                   │
│  5. CTA: "Подать заявку" / "Стать членом ассоциации"            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼ (клик на CTA)
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION DIALOG                            │
│                    (модальное окно)                              │
├─────────────────────────────────────────────────────────────────┤
│  Форма заявки:                                                   │
│  - Персональные данные                                          │
│  - Данные о хозяйстве                                           │
│  - Контактная информация                                        │
│  - Согласие с условиями                                         │
│                                                                  │
│  [Отмена]                              [Подать заявку]          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼ (успешная отправка)
┌─────────────────────────────────────────────────────────────────┐
│                    SUCCESS PAGE                                  │
│                    /membership/success                           │
├─────────────────────────────────────────────────────────────────┤
│  ✓ Спасибо за вашу заявку!                                      │
│                                                                  │
│  Мы получили вашу заявку на членство в Ассоциации ТУРАН.       │
│  Наши специалисты рассмотрят её и свяжутся с вами               │
│  в течение 3-5 рабочих дней.                                    │
│                                                                  │
│  Номер заявки: #TRN-2024-XXXX                                   │
│                                                                  │
│  [На главную]                                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Детальная спецификация страниц

### 3.1 Membership Landing Page (`/membership`)

#### 3.1.1 Hero Section

| Элемент | Описание |
|---------|----------|
| Заголовок | "Станьте членом Ассоциации ТУРАН" |
| Подзаголовок | "Получите доступ к стабильным ценам, прозрачным условиям продажи и поддержке на каждом этапе" |
| CTA Primary | Button "Подать заявку" → открывает Dialog |
| CTA Secondary | Button "Узнать больше" → scroll к секции преимуществ |
| Фоновое изображение | Казахстанские степи / скот (опционально) |

#### 3.1.2 Benefits Section (Преимущества)

**Заголовок секции:** "Почему фермеры выбирают ТУРАН"

| # | Иконка | Заголовок | Описание |
|---|--------|-----------|----------|
| 1 | `Shield` | Гарантированные цены | Фиксированные цены на период matching window, защита от рыночных колебаний |
| 2 | `TrendingUp` | Премиальные надбавки | Дополнительные выплаты за качество, породу и соответствие стандартам |
| 3 | `Truck` | Организованная логистика | Помощь в организации доставки скота до МПК |
| 4 | `Users` | Сообщество фермеров | Обмен опытом, обучение, доступ к лучшим практикам |
| 5 | `Calculator` | Прозрачные расчёты | Понятная система ценообразования и выплат |
| 6 | `HeadphonesIcon` | Поддержка 24/7 | Персональный менеджер и техническая поддержка |

**UI компонент:** `Card` с иконкой, заголовком и описанием. Grid 3 колонки (desktop), 1 колонка (mobile).

#### 3.1.3 How It Works Section (Как это работает)

**Заголовок секции:** "Как стать членом ассоциации"

| Шаг | Заголовок | Описание |
|-----|-----------|----------|
| 1 | Подайте заявку | Заполните форму с информацией о вашем хозяйстве |
| 2 | Проверка данных | Наши специалисты проверят предоставленную информацию |
| 3 | Подписание договора | Ознакомьтесь и подпишите договор членства |
| 4 | Добро пожаловать! | Получите доступ к платформе и начните работу |

**UI компонент:** Вертикальный timeline или numbered steps с иконками и соединительными линиями.

#### 3.1.4 FAQ Section

**Заголовок секции:** "Часто задаваемые вопросы"

| Вопрос | Ответ |
|--------|-------|
| Кто может стать членом ассоциации? | Фермеры Казахстана, занимающиеся разведением КРС, МРС или лошадей, с поголовьем от 10 голов. |
| Есть ли членский взнос? | Членство в ассоциации бесплатное. Комиссия взимается только при успешной продаже скота. |
| Как быстро рассматривается заявка? | Обычно заявки рассматриваются в течение 3-5 рабочих дней. |
| Могу ли я выйти из ассоциации? | Да, вы можете выйти в любой момент, уведомив нас за 30 дней. |
| Какие документы нужны для вступления? | ИИН, документы на хозяйство (при наличии), контактные данные. |

**UI компонент:** `Accordion` из shadcn/ui.

#### 3.1.5 Final CTA Section

| Элемент | Описание |
|---------|----------|
| Заголовок | "Готовы начать?" |
| Подзаголовок | "Присоединяйтесь к сотням фермеров, которые уже работают с ТУРАН" |
| CTA | Button "Подать заявку на членство" (Primary, large) |

---

### 3.2 Application Dialog (Форма заявки)

#### 3.2.1 Структура формы

**Компонент:** `Dialog` из shadcn/ui с `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`.

**Валидация:** Zod schema + React Hook Form

#### 3.2.2 Поля формы

##### Секция 1: Персональные данные

| Поле | Тип | Обязательное | Валидация |
|------|-----|--------------|-----------|
| `full_name` | Input (text) | ✓ | min 2 символа, max 100 |
| `iin` | Input (text) | ✓ | 12 цифр, валидный ИИН |
| `phone` | Input (tel) | ✓ | Казахстанский формат (+7 XXX XXX XX XX) |
| `email` | Input (email) | ✗ | Валидный email |

##### Секция 2: Данные о хозяйстве

| Поле | Тип | Обязательное | Валидация |
|------|-----|--------------|-----------|
| `farm_name` | Input (text) | ✗ | max 200 символов |
| `region` | Select | ✓ | Список регионов Казахстана |
| `district` | Input (text) | ✓ | min 2 символа |
| `settlement` | Input (text) | ✓ | min 2 символа |

##### Секция 3: Информация о скоте

| Поле | Тип | Обязательное | Валидация |
|------|-----|--------------|-----------|
| `livestock_types` | Checkbox group | ✓ | Минимум 1 выбран |
| `herd_size_cattle` | Input (number) | Условно | ≥ 0, если выбран КРС |
| `herd_size_sheep` | Input (number) | Условно | ≥ 0, если выбран МРС |
| `herd_size_horses` | Input (number) | Условно | ≥ 0, если выбраны лошади |
| `experience_years` | Select | ✓ | Опции: <1, 1-3, 3-5, 5-10, >10 лет |

##### Секция 4: Дополнительно

| Поле | Тип | Обязательное | Валидация |
|------|-----|--------------|-----------|
| `how_did_you_hear` | Select | ✗ | Источник информации |
| `comments` | Textarea | ✗ | max 500 символов |
| `terms_accepted` | Checkbox | ✓ | Должен быть true |
| `data_processing_accepted` | Checkbox | ✓ | Должен быть true |

#### 3.2.3 Опции для Select полей

**Регионы Казахстана (`region`):**
- Акмолинская область
- Актюбинская область
- Алматинская область
- Атырауская область
- Восточно-Казахстанская область
- Жамбылская область
- Западно-Казахстанская область
- Карагандинская область
- Костанайская область
- Кызылординская область
- Мангистауская область
- Павлодарская область
- Северо-Казахстанская область
- Туркестанская область
- Улытауская область
- Абай область
- Жетісу область

**Типы скота (`livestock_types`):**
- КРС (крупный рогатый скот)
- МРС (мелкий рогатый скот)
- Лошади

**Опыт (`experience_years`):**
- Менее 1 года
- 1-3 года
- 3-5 лет
- 5-10 лет
- Более 10 лет

**Источник информации (`how_did_you_hear`):**
- Рекомендация другого фермера
- Социальные сети
- Интернет-поиск
- Местная администрация
- СМИ
- Другое

#### 3.2.4 Состояния формы

| Состояние | UI |
|-----------|-----|
| Initial | Пустая форма с placeholder'ами |
| Filling | Введённые данные, валидация при blur |
| Validating | Проверка при попытке отправки |
| Error | Красные бордеры + сообщения под полями |
| Submitting | Button в состоянии loading, форма disabled |
| Success | Закрытие Dialog, редирект на Success page |
| Server Error | Toast с ошибкой, форма остаётся открытой |

---

### 3.3 Success Page (`/membership/success`)

#### 3.3.1 Макет

```
┌─────────────────────────────────────────────────────────────────┐
│                         [Logo ТУРАН]                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ✓ (большая зелёная галочка)                  │
│                                                                  │
│              Спасибо за вашу заявку!                            │
│                                                                  │
│     Мы получили вашу заявку на членство в Ассоциации ТУРАН.    │
│     Наши специалисты рассмотрят её и свяжутся с вами           │
│     в течение 3-5 рабочих дней.                                 │
│                                                                  │
│     ┌─────────────────────────────────────────────────────┐     │
│     │  Номер заявки: #TRN-2024-0042                       │     │
│     │  Дата подачи: 4 февраля 2024                        │     │
│     │  Статус: На рассмотрении                            │     │
│     └─────────────────────────────────────────────────────┘     │
│                                                                  │
│                   Что дальше?                                    │
│                                                                  │
│     1. Наш специалист позвонит вам для уточнения деталей       │
│     2. После проверки вы получите договор на подписание        │
│     3. После подписания вы получите доступ к платформе         │
│                                                                  │
│     ┌──────────────────┐    ┌──────────────────────────────┐   │
│     │   На главную     │    │  Связаться с поддержкой     │   │
│     └──────────────────┘    └──────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.3.2 Данные на странице

| Элемент | Источник |
|---------|----------|
| Номер заявки | Генерируется при сохранении: `TRN-{год}-{порядковый номер}` |
| Дата подачи | Текущая дата из `created_at` |
| Статус | Всегда "На рассмотрении" для новых заявок |

#### 3.3.3 Действия

| Кнопка | Действие |
|--------|----------|
| На главную | Переход на `/welcome` |
| Связаться с поддержкой | Открывает `mailto:` или показывает контакты |

---

## 4. Техническая спецификация

### 4.1 Файловая структура

```
src/
├── pages/
│   └── membership/
│       ├── MembershipLanding.tsx      # Основная страница
│       └── MembershipSuccess.tsx      # Страница успеха
├── components/
│   └── membership/
│       ├── MembershipHero.tsx         # Hero секция
│       ├── MembershipBenefits.tsx     # Карточки преимуществ
│       ├── MembershipSteps.tsx        # Шаги вступления
│       ├── MembershipFAQ.tsx          # FAQ аккордеон
│       ├── MembershipCTA.tsx          # CTA секции
│       └── MembershipApplicationDialog.tsx  # Форма заявки
├── hooks/
│   └── useMembershipApplication.ts    # Hook для работы с заявками
├── lib/
│   └── membership-validation.ts       # Zod схема валидации
└── i18n/
    └── locales/
        ├── ru.json  # + membership секция
        ├── en.json  # + membership секция
        └── kk.json  # + membership секция
```

### 4.2 Роутинг

Добавить в `App.tsx`:

```tsx
// Публичные роуты (без авторизации)
<Route path="/membership" element={<MembershipLanding />} />
<Route path="/membership/success" element={<MembershipSuccess />} />
```

### 4.3 База данных (Supabase)

#### Новая таблица: `membership_applications`

```sql
CREATE TABLE membership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT UNIQUE NOT NULL,  -- TRN-2024-0001

  -- Персональные данные
  full_name TEXT NOT NULL,
  iin TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,

  -- Данные о хозяйстве
  farm_name TEXT,
  region TEXT NOT NULL,
  district TEXT NOT NULL,
  settlement TEXT NOT NULL,

  -- Информация о скоте
  livestock_types TEXT[] NOT NULL,  -- ['cattle', 'sheep', 'horses']
  herd_size_cattle INTEGER DEFAULT 0,
  herd_size_sheep INTEGER DEFAULT 0,
  herd_size_horses INTEGER DEFAULT 0,
  experience_years TEXT NOT NULL,

  -- Дополнительно
  how_did_you_hear TEXT,
  comments TEXT,

  -- Метаданные
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, reviewing, approved, rejected
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Связь с созданным фермером (после одобрения)
  farmer_id UUID REFERENCES farmers(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_membership_applications_status ON membership_applications(status);
CREATE INDEX idx_membership_applications_iin ON membership_applications(iin);
CREATE INDEX idx_membership_applications_created_at ON membership_applications(created_at DESC);

-- RLS политики
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

-- Публичная вставка (для подачи заявки без авторизации)
CREATE POLICY "Anyone can submit application" ON membership_applications
  FOR INSERT WITH CHECK (true);

-- Только админы могут читать и обновлять
CREATE POLICY "Admins can read applications" ON membership_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update applications" ON membership_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Функция генерации номера заявки
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
  new_number TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');

  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(application_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO seq_num
  FROM membership_applications
  WHERE application_number LIKE 'TRN-' || year_part || '-%';

  new_number := 'TRN-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  NEW.application_number := new_number;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_application_number
  BEFORE INSERT ON membership_applications
  FOR EACH ROW
  EXECUTE FUNCTION generate_application_number();
```

### 4.4 Zod Schema

```typescript
// src/lib/membership-validation.ts

import { z } from 'zod';

const kazakhstanPhoneRegex = /^\+7\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}$/;
const iinRegex = /^\d{12}$/;

export const membershipApplicationSchema = z.object({
  // Персональные данные
  full_name: z.string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Имя не должно превышать 100 символов'),
  iin: z.string()
    .regex(iinRegex, 'ИИН должен содержать 12 цифр'),
  phone: z.string()
    .regex(kazakhstanPhoneRegex, 'Введите номер в формате +7 XXX XXX XX XX'),
  email: z.string()
    .email('Введите корректный email')
    .optional()
    .or(z.literal('')),

  // Данные о хозяйстве
  farm_name: z.string().max(200).optional(),
  region: z.string().min(1, 'Выберите область'),
  district: z.string().min(2, 'Введите район'),
  settlement: z.string().min(2, 'Введите населённый пункт'),

  // Информация о скоте
  livestock_types: z.array(z.enum(['cattle', 'sheep', 'horses']))
    .min(1, 'Выберите хотя бы один вид скота'),
  herd_size_cattle: z.number().min(0).optional(),
  herd_size_sheep: z.number().min(0).optional(),
  herd_size_horses: z.number().min(0).optional(),
  experience_years: z.enum(['<1', '1-3', '3-5', '5-10', '>10'], {
    required_error: 'Выберите опыт работы',
  }),

  // Дополнительно
  how_did_you_hear: z.string().optional(),
  comments: z.string().max(500).optional(),

  // Согласия
  terms_accepted: z.literal(true, {
    errorMap: () => ({ message: 'Необходимо принять условия' }),
  }),
  data_processing_accepted: z.literal(true, {
    errorMap: () => ({ message: 'Необходимо дать согласие на обработку данных' }),
  }),
}).refine((data) => {
  // Проверка что хотя бы одно поголовье > 0
  const hasLivestock =
    (data.livestock_types.includes('cattle') && (data.herd_size_cattle || 0) > 0) ||
    (data.livestock_types.includes('sheep') && (data.herd_size_sheep || 0) > 0) ||
    (data.livestock_types.includes('horses') && (data.herd_size_horses || 0) > 0);
  return hasLivestock;
}, {
  message: 'Укажите количество голов хотя бы для одного вида скота',
  path: ['livestock_types'],
});

export type MembershipApplicationData = z.infer<typeof membershipApplicationSchema>;
```

### 4.5 API Hook

```typescript
// src/hooks/useMembershipApplication.ts

import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MembershipApplicationData } from '@/lib/membership-validation';

interface SubmitApplicationResult {
  application_number: string;
  created_at: string;
}

export function useMembershipApplication() {
  return useMutation<SubmitApplicationResult, Error, MembershipApplicationData>({
    mutationFn: async (data) => {
      const { terms_accepted, data_processing_accepted, ...applicationData } = data;

      const { data: result, error } = await supabase
        .from('membership_applications')
        .insert([applicationData])
        .select('application_number, created_at')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return result;
    },
  });
}
```

### 4.6 i18n ключи

```json
// Добавить в ru.json, en.json, kk.json

{
  "membership": {
    "hero": {
      "title": "Станьте членом Ассоциации ТУРАН",
      "subtitle": "Получите доступ к стабильным ценам, прозрачным условиям продажи и поддержке на каждом этапе",
      "cta_primary": "Подать заявку",
      "cta_secondary": "Узнать больше"
    },
    "benefits": {
      "title": "Почему фермеры выбирают ТУРАН",
      "guaranteed_prices": {
        "title": "Гарантированные цены",
        "description": "Фиксированные цены на период matching window, защита от рыночных колебаний"
      },
      "premiums": {
        "title": "Премиальные надбавки",
        "description": "Дополнительные выплаты за качество, породу и соответствие стандартам"
      },
      "logistics": {
        "title": "Организованная логистика",
        "description": "Помощь в организации доставки скота до МПК"
      },
      "community": {
        "title": "Сообщество фермеров",
        "description": "Обмен опытом, обучение, доступ к лучшим практикам"
      },
      "transparent": {
        "title": "Прозрачные расчёты",
        "description": "Понятная система ценообразования и выплат"
      },
      "support": {
        "title": "Поддержка 24/7",
        "description": "Персональный менеджер и техническая поддержка"
      }
    },
    "steps": {
      "title": "Как стать членом ассоциации",
      "step1": {
        "title": "Подайте заявку",
        "description": "Заполните форму с информацией о вашем хозяйстве"
      },
      "step2": {
        "title": "Проверка данных",
        "description": "Наши специалисты проверят предоставленную информацию"
      },
      "step3": {
        "title": "Подписание договора",
        "description": "Ознакомьтесь и подпишите договор членства"
      },
      "step4": {
        "title": "Добро пожаловать!",
        "description": "Получите доступ к платформе и начните работу"
      }
    },
    "faq": {
      "title": "Часто задаваемые вопросы",
      "q1": {
        "question": "Кто может стать членом ассоциации?",
        "answer": "Фермеры Казахстана, занимающиеся разведением КРС, МРС или лошадей, с поголовьем от 10 голов."
      },
      "q2": {
        "question": "Есть ли членский взнос?",
        "answer": "Членство в ассоциации бесплатное. Комиссия взимается только при успешной продаже скота."
      },
      "q3": {
        "question": "Как быстро рассматривается заявка?",
        "answer": "Обычно заявки рассматриваются в течение 3-5 рабочих дней."
      },
      "q4": {
        "question": "Могу ли я выйти из ассоциации?",
        "answer": "Да, вы можете выйти в любой момент, уведомив нас за 30 дней."
      },
      "q5": {
        "question": "Какие документы нужны для вступления?",
        "answer": "ИИН, документы на хозяйство (при наличии), контактные данные."
      }
    },
    "final_cta": {
      "title": "Готовы начать?",
      "subtitle": "Присоединяйтесь к сотням фермеров, которые уже работают с ТУРАН",
      "button": "Подать заявку на членство"
    },
    "form": {
      "title": "Заявка на членство",
      "description": "Заполните форму, и мы свяжемся с вами",
      "sections": {
        "personal": "Персональные данные",
        "farm": "Данные о хозяйстве",
        "livestock": "Информация о скоте",
        "additional": "Дополнительно"
      },
      "fields": {
        "full_name": "ФИО",
        "iin": "ИИН",
        "phone": "Телефон",
        "email": "Email (необязательно)",
        "farm_name": "Название хозяйства (необязательно)",
        "region": "Область",
        "district": "Район",
        "settlement": "Населённый пункт",
        "livestock_types": "Виды скота",
        "cattle": "КРС (крупный рогатый скот)",
        "sheep": "МРС (мелкий рогатый скот)",
        "horses": "Лошади",
        "herd_size_cattle": "Поголовье КРС",
        "herd_size_sheep": "Поголовье МРС",
        "herd_size_horses": "Поголовье лошадей",
        "experience_years": "Опыт в животноводстве",
        "how_did_you_hear": "Откуда вы узнали о нас?",
        "comments": "Комментарий (необязательно)",
        "terms_accepted": "Я принимаю условия членства в ассоциации",
        "data_processing_accepted": "Я даю согласие на обработку персональных данных"
      },
      "experience_options": {
        "<1": "Менее 1 года",
        "1-3": "1-3 года",
        "3-5": "3-5 лет",
        "5-10": "5-10 лет",
        ">10": "Более 10 лет"
      },
      "source_options": {
        "referral": "Рекомендация другого фермера",
        "social": "Социальные сети",
        "search": "Интернет-поиск",
        "government": "Местная администрация",
        "media": "СМИ",
        "other": "Другое"
      },
      "submit": "Подать заявку",
      "cancel": "Отмена",
      "submitting": "Отправка..."
    },
    "success": {
      "title": "Спасибо за вашу заявку!",
      "message": "Мы получили вашу заявку на членство в Ассоциации ТУРАН. Наши специалисты рассмотрят её и свяжутся с вами в течение 3-5 рабочих дней.",
      "application_number": "Номер заявки",
      "submission_date": "Дата подачи",
      "status": "Статус",
      "status_pending": "На рассмотрении",
      "next_steps": {
        "title": "Что дальше?",
        "step1": "Наш специалист позвонит вам для уточнения деталей",
        "step2": "После проверки вы получите договор на подписание",
        "step3": "После подписания вы получите доступ к платформе"
      },
      "back_home": "На главную",
      "contact_support": "Связаться с поддержкой"
    }
  }
}
```

---

## 5. UI/UX требования

### 5.1 Адаптивность

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Одноколоночная раскладка, полноэкранный Dialog |
| Tablet (640-1024px) | Двухколоночные карточки, центрированный Dialog |
| Desktop (>1024px) | Трёхколоночные карточки, Dialog 600px ширина |

### 5.2 Accessibility

- Все формы должны иметь правильные `label` и `aria-*` атрибуты
- Фокус должен переходить к Dialog при открытии
- Escape закрывает Dialog
- Tab навигация через все элементы формы
- Сообщения об ошибках связаны с полями через `aria-describedby`

### 5.3 Производительность

- Lazy loading для страниц membership
- Оптимизированные изображения (WebP с fallback)
- Form validation на клиенте перед отправкой

### 5.4 Анимации

- Плавное появление Dialog (fade + scale)
- Smooth scroll при клике "Узнать больше"
- Loading spinner в кнопке при отправке
- Success checkmark анимация на странице успеха

---

## 6. Acceptance Criteria

### 6.1 Membership Landing Page

- [ ] Страница доступна по URL `/membership` без авторизации
- [ ] Hero секция отображает заголовок, подзаголовок и CTA кнопки
- [ ] Секция преимуществ показывает 6 карточек с иконками
- [ ] Секция шагов показывает 4 шага с номерами
- [ ] FAQ секция работает как аккордеон
- [ ] CTA кнопки открывают форму заявки
- [ ] Страница адаптивна для mobile/tablet/desktop
- [ ] Страница переведена на 3 языка (ru/en/kk)

### 6.2 Application Dialog

- [ ] Dialog открывается по клику на любую CTA кнопку
- [ ] Форма содержит все указанные поля
- [ ] Валидация работает при blur и submit
- [ ] Ошибки отображаются под соответствующими полями
- [ ] Кнопка Submit disabled пока форма невалидна
- [ ] При отправке показывается loading состояние
- [ ] При ошибке сервера показывается toast
- [ ] При успехе происходит редирект на Success page

### 6.3 Success Page

- [ ] Страница доступна по URL `/membership/success`
- [ ] Отображается номер заявки
- [ ] Отображается дата подачи
- [ ] Отображаются следующие шаги
- [ ] Кнопка "На главную" ведёт на `/welcome`
- [ ] Кнопка "Связаться с поддержкой" показывает контакты

### 6.4 Backend

- [ ] Заявка сохраняется в таблицу `membership_applications`
- [ ] Автоматически генерируется номер заявки
- [ ] RLS позволяет вставку без авторизации
- [ ] Только админы могут читать и обновлять заявки

---

## 7. Метрики успеха

| Метрика | Цель |
|---------|------|
| Конверсия посещение → открытие формы | > 30% |
| Конверсия открытие формы → отправка | > 50% |
| Время заполнения формы | < 5 минут |
| Количество ошибок валидации на пользователя | < 3 |
| Bounce rate страницы | < 40% |

---

## 8. Зависимости и риски

### 8.1 Зависимости

- Supabase должен быть настроен с новой таблицей
- i18n ключи должны быть добавлены до разработки UI
- Дизайн-система уже содержит все необходимые компоненты

### 8.2 Риски

| Риск | Митигация |
|------|-----------|
| Спам заявки | Добавить rate limiting, CAPTCHA (Phase 2) |
| Дубликаты по ИИН | Уведомлять пользователя, но сохранять заявку |
| Большой размер формы | Разбить на шаги (Phase 2 - Stepper) |

---

## 9. Будущие улучшения (Phase 2)

1. **Multi-step форма** - разбить форму на логические шаги с прогресс-баром
2. **Автозаполнение по ИИН** - интеграция с гос. реестрами
3. **Загрузка документов** - возможность прикрепить документы
4. **CAPTCHA** - защита от спама
5. **Email уведомления** - автоматические письма о статусе заявки
6. **SMS уведомления** - оповещения по SMS
7. **Админ-панель заявок** - страница управления заявками для админов
8. **Статус заявки онлайн** - проверка статуса по номеру заявки

---

## 10. Timeline (Оценка)

| Этап | Задачи |
|------|--------|
| 1 | Database migration, API hook, validation schema |
| 2 | MembershipLanding page с секциями |
| 3 | MembershipApplicationDialog с формой |
| 4 | MembershipSuccess page |
| 5 | i18n переводы (ru/en/kk) |
| 6 | Тестирование и исправления |
