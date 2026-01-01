# Glossary

## Domain Terms

### A

**Active Status**
- **EN**: Account status indicating full platform access and participation rights
- **RU**: Статус аккаунта, указывающий на полный доступ к платформе и права на участие

**Admin**
- **EN**: Platform coordinator (TURAN/ZENGI) with full visibility and coordination responsibilities
- **RU**: Координатор платформы (TURAN/ZENGI) с полной видимостью и обязанностями координации

**Aggregated Data**
- **EN**: Combined, anonymized data from multiple participants (no individual identities)
- **RU**: Объединенные, анонимизированные данные от нескольких участников (без индивидуальных идентификаторов)

### B

**Batch**
- **EN**: A declared livestock supply unit with specific characteristics (heads, grade, region, etc.)
- **RU**: Объявленная единица предложения скота с конкретными характеристиками (головы, сорт, регион и т.д.)

**Batch Lifecycle**
- **EN**: The finite state machine progression: Draft → Forecast → Soft Committed → Confirmed → Matched → Closed
- **RU**: Прогрессия конечного автомата состояний: Черновик → Прогноз → Предварительно → Подтверждено → Сопоставлено → Закрыто

**Binding Data**
- **EN**: Data that creates actual market commitments (e.g., Confirmed batches, Submitted pool requests)
- **RU**: Данные, которые создают фактические рыночные обязательства (например, Подтвержденные партии, Поданные заявки на пул)

### C

**Confirmed Status**
- **EN**: Batch status indicating firm commitment, ready for pool matching (locked, read-only)
- **RU**: Статус партии, указывающий на твердое обязательство, готово к сопоставлению пула (заблокировано, только чтение)

**Coordinator**
- **EN**: Admin role - facilitates matching and coordination, does not act as market maker
- **RU**: Роль администратора - обеспечивает сопоставление и координацию, не действует как маркет-мейкер

### D

**Draft Status**
- **EN**: Initial batch or pool request status, not yet visible to pool, fully editable
- **RU**: Начальный статус партии или заявки на пул, еще не виден в пуле, полностью редактируемый

### E

**Execution**
- **EN**: The delivery and settlement process after matching is finalized
- **RU**: Процесс поставки и расчетов после финализации сопоставления

**Execution Lifecycle**
- **EN**: FSM for execution: Matched → Scheduled → Delivered → Confirmed → Settled → Closed
- **RU**: FSM для выполнения: Сопоставлено → Запланировано → Поставлено → Подтверждено → Рассчитано → Закрыто

### F

**Farmer**
- **EN**: Supply-side participant who declares livestock batches
- **RU**: Участник стороны предложения, который объявляет партии скота

**Forecast Status**
- **EN**: Batch status indicating early availability signal, visible in market overview, editable
- **RU**: Статус партии, указывающий на ранний сигнал доступности, виден в обзоре рынка, редактируемый

**FSM (Finite State Machine)**
- **EN**: Strict state machine that controls status transitions and prevents invalid operations
- **RU**: Строгий конечный автомат состояний, который контролирует переходы статусов и предотвращает недопустимые операции

**Fulfilled Status**
- **EN**: Pool request status indicating fully matched (100% of required volume)
- **RU**: Статус заявки на пул, указывающий на полное сопоставление (100% требуемого объема)

### H

**Herd Structure**
- **EN**: Voluntary, indicative capacity data (snapshots) used for national planning, NOT supply commitments
- **RU**: Добровольные, индикативные данные о мощности (снимки), используемые для национального планирования, НЕ обязательства по предложению

### I

**Indicative Data**
- **EN**: Data for planning and visibility only, does NOT create commitments (e.g., Herd Structure, Market Intent)
- **RU**: Данные только для планирования и видимости, НЕ создают обязательств (например, Структура стада, Рыночное намерение)

### M

**Matching**
- **EN**: The process of allocating confirmed batches to pool requests (admin-mediated)
- **RU**: Процесс распределения подтвержденных партий по заявкам на пул (опосредовано администратором)

**Matching Window**
- **EN**: Time-based coordination period with states: Upcoming → Active → Locked → Closed
- **RU**: Временной период координации со статусами: Предстоящее → Активное → Заблокировано → Закрыто

**Matched Status**
- **EN**: Batch status indicating allocation to a pool request, execution record created
- **RU**: Статус партии, указывающий на распределение в заявку на пул, создана запись выполнения

**Market Intent**
- **EN**: Voluntary, non-binding availability signals, does NOT create batches or commitments
- **RU**: Добровольные, необязательные сигналы доступности, НЕ создают партии или обязательства

**MPK (Meat Processing Plant)**
- **EN**: Demand-side participant who creates pool requests
- **RU**: Участник стороны спроса, который создает заявки на пул

### O

**Observer Status**
- **EN**: Account status indicating registration pending or under review, limited read-only access
- **RU**: Статус аккаунта, указывающий на ожидание регистрации или на рассмотрении, ограниченный доступ только для чтения

**Offtake Registry**
- **EN**: System tracking delivery and settlement records (execution lifecycle)
- **RU**: Система отслеживания записей поставок и расчетов (жизненный цикл выполнения)

### P

**Partial Status**
- **EN**: Pool request status indicating partially matched (some but not all volume matched)
- **RU**: Статус заявки на пул, указывающий на частичное сопоставление (часть, но не весь объем сопоставлен)

**Pool Request**
- **EN**: MPK's binding demand declaration with volume, grade, regions, and acceptance criteria
- **RU**: Обязательное заявление о спросе МПК с объемом, сортом, регионами и критериями приемки

**Premium**
- **EN**: Incentive-based reward (₸/kg) for compliance, predictability, and standards (NOT price control)
- **RU**: Стимулирующая награда (₸/кг) за соблюдение правил, предсказуемость и стандарты (НЕ контроль цен)

**Predictability Premium**
- **EN**: Premium based on confirmation timing relative to matching window lock date
- **RU**: Премия на основе времени подтверждения относительно даты блокировки окна сопоставления

### R

**Reference Price Grid**
- **EN**: Indicative market benchmarks by grade and weight category (NOT mandatory prices)
- **RU**: Индикативные рыночные ориентиры по сорту и весовой категории (НЕ обязательные цены)

**Reliability Premium**
- **EN**: Premium based on farmer grading (observer, declared_supplier, standard_supplier)
- **RU**: Премия на основе оценки фермера (наблюдатель, объявленный поставщик, стандартный поставщик)

**RLS (Row Level Security)**
- **EN**: Database-level security enforcing role-based data access
- **RU**: Безопасность на уровне базы данных, обеспечивающая доступ к данным на основе ролей

### S

**Soft Committed Status**
- **EN**: Batch status indicating preliminary commitment, editable with confirmation, partially binding
- **RU**: Статус партии, указывающий на предварительное обязательство, редактируемый с подтверждением, частично обязательный

**Standard Compliance Premium**
- **EN**: Premium based on standard_status field (non_standard, standard, high_standard)
- **RU**: Премия на основе поля standard_status (нестандартный, стандартный, высокий стандарт)

**Submitted Status**
- **EN**: Pool request status indicating binding demand request, locked for MPK, ready for matching
- **RU**: Статус заявки на пул, указывающий на обязательную заявку на спрос, заблокирован для МПК, готов к сопоставлению

### V

**Volume Consistency Premium**
- **EN**: Premium based on delivery rate and months active (consistent delivery = higher premium)
- **RU**: Премия на основе процента поставок и месяцев активности (последовательные поставки = более высокая премия)

---

## Abbreviations

- **FSM**: Finite State Machine
- **MPK**: Meat Processing Plant (Мясоперерабатывающее предприятие)
- **RLS**: Row Level Security
- **RBAC**: Role-Based Access Control
- **TURAN**: Platform coordinator organization
- **ZENGI**: Platform coordinator organization

---

## Status Quick Reference

### Batch Statuses
- `draft` → `forecast` → `soft_committed` → `confirmed` → `matched` → `closed`

### Pool Request Statuses
- `draft` → `submitted` → `matching` → `partial`/`fulfilled` → `closed`
- Can be `cancelled` from most states

### Matching Window Statuses
- `upcoming` → `active` → `locked` → `closed`

### Execution Statuses
- `matched` → `scheduled` → `delivered` → `confirmed` → `settled` → `closed`

---

## Next Steps

- [Introduction](/docs/en/introduction/) - Platform overview
- [Role Model](/docs/en/roles/) - Roles and permissions
- [Business Logic](/docs/en/business-logic/) - Critical rules

