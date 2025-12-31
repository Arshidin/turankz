-- ============================================================================
-- СКРИПТ ДЛЯ ТЕСТИРОВАНИЯ МИГРАЦИЙ
-- ============================================================================
-- Этот скрипт проверяет результаты применения миграций
-- Запустите после применения всех миграций на dev окружении
-- ============================================================================

-- ============================================================================
-- ПРОВЕРКА 1: RLS ПОЛИТИКИ
-- ============================================================================

-- Проверить, что политики используют has_role()
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN pg_get_expr(polqual, polrelid) LIKE '%has_role%' THEN '✅ Использует has_role()'
        ELSE '❌ НЕ использует has_role()'
    END as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND policyname LIKE '%Admins can%'
ORDER BY tablename, policyname;

-- Проверить функцию has_role()
SELECT 
    proname,
    CASE 
        WHEN proname = 'has_role' THEN '✅ Функция существует'
        ELSE '❌ Функция не найдена'
    END as status
FROM pg_proc 
WHERE proname = 'has_role';

-- ============================================================================
-- ПРОВЕРКА 2: BATCH STATUS ENUM
-- ============================================================================

-- Проверить значения enum
SELECT 
    unnest(enum_range(NULL::batch_status)) as enum_value,
    CASE 
        WHEN unnest(enum_range(NULL::batch_status))::text IN ('draft', 'forecast', 'soft_committed', 'confirmed', 'matched', 'closed') 
        THEN '✅ Валидное значение'
        ELSE '❌ Неожиданное значение'
    END as status
ORDER BY enum_value;

-- Проверить, что нет batches с 'delivered'
SELECT 
    COUNT(*) as delivered_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Нет batches с delivered'
        ELSE '❌ Найдены batches с delivered'
    END as status
FROM batches 
WHERE status::text = 'delivered';

-- Проверить default значение
SELECT 
    column_default,
    CASE 
        WHEN column_default LIKE '%draft%' THEN '✅ Default = draft'
        ELSE '❌ Default не установлен на draft'
    END as status
FROM information_schema.columns 
WHERE table_name = 'batches' 
AND column_name = 'status';

-- Проверить распределение статусов
SELECT 
    status::text,
    COUNT(*) as count
FROM batches
GROUP BY status
ORDER BY status;

-- ============================================================================
-- ПРОВЕРКА 3: FSM ТРИГГЕРЫ
-- ============================================================================

-- Проверить функции валидации
SELECT 
    proname,
    CASE 
        WHEN proname LIKE 'validate_%_status_transition' THEN '✅ Функция существует'
        ELSE '❌ Функция не найдена'
    END as status
FROM pg_proc 
WHERE proname IN ('validate_batch_status_transition', 'validate_pool_request_status_transition')
ORDER BY proname;

-- Проверить триггеры
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    CASE 
        WHEN tgname LIKE '%_status_validation' THEN '✅ Триггер существует'
        ELSE '❌ Триггер не найден'
    END as status
FROM pg_trigger 
WHERE tgname IN ('batch_status_validation', 'pool_request_status_validation')
ORDER BY tgname;

-- ============================================================================
-- ПРОВЕРКА 4: MATCHING WINDOW VALIDATION
-- ============================================================================

-- Проверить функцию валидации matching window
SELECT 
    proname,
    CASE 
        WHEN proname = 'validate_matching_window' THEN '✅ Функция существует'
        ELSE '❌ Функция не найдена'
    END as status
FROM pg_proc 
WHERE proname = 'validate_matching_window';

-- Проверить триггер
SELECT 
    tgname,
    tgrelid::regclass as table_name,
    CASE 
        WHEN tgname = 'matching_window_validation' THEN '✅ Триггер существует'
        ELSE '❌ Триггер не найден'
    END as status
FROM pg_trigger 
WHERE tgname = 'matching_window_validation';

-- ============================================================================
-- ПРОВЕРКА 5: ИНДЕКСЫ
-- ============================================================================

-- Проверить количество созданных индексов
SELECT 
    COUNT(*) as index_count,
    CASE 
        WHEN COUNT(*) >= 25 THEN '✅ Достаточно индексов'
        ELSE '❌ Недостаточно индексов'
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

-- Список всех индексов
SELECT 
    tablename,
    indexname,
    CASE 
        WHEN indexname LIKE 'idx_%' THEN '✅ Новый индекс'
        ELSE 'Старый индекс'
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Проверить конкретные важные индексы
SELECT 
    indexname,
    tablename,
    CASE 
        WHEN indexname IN (
            'idx_batches_status',
            'idx_pool_requests_status',
            'idx_matching_windows_start_date',
            'idx_pool_matches_window_id'
        ) THEN '✅ Критический индекс существует'
        ELSE 'Индекс существует'
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN (
    'idx_batches_status',
    'idx_batches_farmer_id',
    'idx_pool_requests_status',
    'idx_pool_requests_mpk_id',
    'idx_matching_windows_start_date',
    'idx_matching_windows_lock_date',
    'idx_pool_matches_window_id',
    'idx_pool_matches_batch_id',
    'idx_executions_match_id',
    'idx_activity_log_event_created'
)
ORDER BY tablename, indexname;

-- ============================================================================
-- ПРОВЕРКА 6: ОБЩАЯ ЦЕЛОСТНОСТЬ
-- ============================================================================

-- Проверить, что все таблицы существуют
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'batches', 'purchase_pool_requests', 'pool_matches', 
            'matching_windows', 'farmers', 'mpks', 'activity_log'
        ) THEN '✅ Таблица существует'
        ELSE '❌ Таблица не найдена'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'batches', 'purchase_pool_requests', 'pool_matches', 
    'matching_windows', 'farmers', 'mpks', 'activity_log'
)
ORDER BY table_name;

-- Проверить количество записей в основных таблицах
SELECT 
    'batches' as table_name,
    COUNT(*) as record_count
FROM batches
UNION ALL
SELECT 
    'purchase_pool_requests',
    COUNT(*)
FROM purchase_pool_requests
UNION ALL
SELECT 
    'pool_matches',
    COUNT(*)
FROM pool_matches
UNION ALL
SELECT 
    'matching_windows',
    COUNT(*)
FROM matching_windows
ORDER BY table_name;

-- ============================================================================
-- ИТОГОВАЯ СВОДКА
-- ============================================================================

SELECT 
    '=== ИТОГОВАЯ СВОДКА ПРОВЕРОК ===' as summary;

-- Подсчет успешных проверок
SELECT 
    'RLS политики используют has_role()' as check_name,
    COUNT(*) as passed_count,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND policyname LIKE '%Admins can%') as total_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND policyname LIKE '%Admins can%'
AND pg_get_expr(polqual, polrelid) LIKE '%has_role%';

SELECT 
    'FSM функции созданы' as check_name,
    COUNT(*) as passed_count
FROM pg_proc 
WHERE proname IN ('validate_batch_status_transition', 'validate_pool_request_status_transition');

SELECT 
    'FSM триггеры созданы' as check_name,
    COUNT(*) as passed_count
FROM pg_trigger 
WHERE tgname IN ('batch_status_validation', 'pool_request_status_validation');

SELECT 
    'Matching window validation создан' as check_name,
    COUNT(*) as passed_count
FROM pg_proc 
WHERE proname = 'validate_matching_window';

SELECT 
    'Индексы созданы' as check_name,
    COUNT(*) as passed_count
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

-- ============================================================================
-- КОНЕЦ ПРОВЕРОК
-- ============================================================================

