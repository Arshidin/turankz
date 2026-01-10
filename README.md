# TURAN Standard Pool

B2B координационная инфраструктура для рынка живого скота Казахстана.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Auth + RLS)
- i18n (ru, en, kk)

## Quick Start

```bash
npm install
npm run dev
```

## Documentation

Полная документация: [.claude/docs/INDEX.md](.claude/docs/INDEX.md)

### Структура документации

```
.claude/docs/
├── INDEX.md              # Главный индекс
├── architecture/         # Архитектура, доступ, БД
├── features/             # Анализ модулей
│   ├── modules/          # FSM, delivery periods
│   └── components/       # UI компоненты
├── deployment/           # Деплой, чеклисты
├── testing/              # Тест-планы, отчёты
└── guides/               # Руководства
```

## Key Concepts

**TSP is INFRASTRUCTURE, not a marketplace:**
- Не устанавливает цены
- Не гарантирует сделки
- Не выступает стороной в транзакциях

## Roles

| Role | Description |
|------|-------------|
| Farmer | Заявляет партии скота, формирует обязательства |
| MPK | Создаёт заявки на закупку, участвует в пулах |
| Admin | Управление платформой, сопоставление |

## Commands

```bash
npm run dev       # Dev server
npm run build     # Production build
npx tsc --noEmit  # TypeScript check
```

## Project Structure

```
src/
├── components/   # UI components
├── pages/        # Route pages
├── hooks/        # React hooks
├── lib/          # Supabase, utilities
├── i18n/         # Translations
└── types/        # TypeScript types
```
