-- ============================================================================
-- ТЕСТИРОВАНИЕ FSM ТРИГГЕРОВ
-- ============================================================================
-- Этот скрипт тестирует валидные и невалидные переходы статусов
-- ВНИМАНИЕ: Создаст тестовые данные, которые потом нужно удалить
-- ============================================================================

-- ============================================================================
-- ТЕСТ 1: BATCH STATUS TRANSITIONS
-- ============================================================================

-- Создать тестовый batch
DO $$
DECLARE
    test_batch_id UUID;
    test_farmer_id UUID;
BEGIN
    -- Получить первого farmer для теста
    SELECT id INTO test_farmer_id FROM farmers LIMIT 1;
    
    IF test_farmer_id IS NULL THEN
        RAISE NOTICE 'Нет farmers в БД. Создайте тестового farmer сначала.';
        RETURN;
    END IF;
    
    -- Создать тестовый batch
    INSERT INTO batches (
        batch_number, farmer_id, heads, avg_weight, grade, region, 
        status, target_week, created_at, updated_at
    ) VALUES (
        'TEST-BATCH-' || gen_random_uuid()::text,
        test_farmer_id,
        10,
        300,
        'A',
        'Almaty',
        'draft',
        'Week 1, 2025',
        NOW(),
        NOW()
    ) RETURNING id INTO test_batch_id;
    
    RAISE NOTICE 'Создан тестовый batch: %', test_batch_id;
    
    -- ТЕСТ 1.1: Валидный переход draft → forecast
    BEGIN
        UPDATE batches SET status = 'forecast' WHERE id = test_batch_id;
        RAISE NOTICE '✅ ТЕСТ 1.1 ПРОЙДЕН: draft → forecast (валидный)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ТЕСТ 1.1 ПРОВАЛЕН: draft → forecast должен быть валидным. Ошибка: %', SQLERRM;
    END;
    
    -- ТЕСТ 1.2: Валидный переход forecast → soft_committed
    BEGIN
        UPDATE batches SET status = 'soft_committed' WHERE id = test_batch_id;
        RAISE NOTICE '✅ ТЕСТ 1.2 ПРОЙДЕН: forecast → soft_committed (валидный)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ТЕСТ 1.2 ПРОВАЛЕН: forecast → soft_committed должен быть валидным. Ошибка: %', SQLERRM;
    END;
    
    -- ТЕСТ 1.3: Валидный переход soft_committed → confirmed
    BEGIN
        UPDATE batches SET status = 'confirmed' WHERE id = test_batch_id;
        RAISE NOTICE '✅ ТЕСТ 1.3 ПРОЙДЕН: soft_committed → confirmed (валидный)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ТЕСТ 1.3 ПРОВАЛЕН: soft_committed → confirmed должен быть валидным. Ошибка: %', SQLERRM;
    END;
    
    -- ТЕСТ 1.4: Невалидный переход confirmed → draft (должен быть заблокирован)
    BEGIN
        UPDATE batches SET status = 'draft' WHERE id = test_batch_id;
        RAISE NOTICE '❌ ТЕСТ 1.4 ПРОВАЛЕН: confirmed → draft должен быть заблокирован, но прошел!';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%Invalid batch status transition%' THEN
            RAISE NOTICE '✅ ТЕСТ 1.4 ПРОЙДЕН: confirmed → draft заблокирован (как и ожидалось)';
        ELSE
            RAISE NOTICE '⚠️ ТЕСТ 1.4: Неожиданная ошибка: %', SQLERRM;
        END IF;
    END;
    
    -- ТЕСТ 1.5: Валидный переход confirmed → closed (admin может закрыть)
    BEGIN
        UPDATE batches SET status = 'closed' WHERE id = test_batch_id;
        RAISE NOTICE '✅ ТЕСТ 1.5 ПРОЙДЕН: confirmed → closed (валидный)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ТЕСТ 1.5 ПРОВАЛЕН: confirmed → closed должен быть валидным. Ошибка: %', SQLERRM;
    END;
    
    -- Удалить тестовый batch
    DELETE FROM batches WHERE id = test_batch_id;
    RAISE NOTICE 'Тестовый batch удален';
    
END $$;

-- ============================================================================
-- ТЕСТ 2: POOL REQUEST STATUS TRANSITIONS
-- ============================================================================

-- Создать тестовый pool request
DO $$
DECLARE
    test_request_id UUID;
    test_mpk_id TEXT;
BEGIN
    -- Получить первого MPK для теста
    SELECT mpk_id INTO test_mpk_id FROM mpks LIMIT 1;
    
    IF test_mpk_id IS NULL THEN
        RAISE NOTICE 'Нет MPKs в БД. Создайте тестового MPK сначала.';
        RETURN;
    END IF;
    
    -- Создать тестовый request
    INSERT INTO purchase_pool_requests (
        request_number, mpk_id, mpk_name, required_volume, required_grade,
        regions, target_week, status, matched_volume, created_at, updated_at
    ) VALUES (
        'TEST-REQ-' || gen_random_uuid()::text,
        test_mpk_id,
        'Test MPK',
        100,
        'A',
        ARRAY['Almaty'],
        'Week 1, 2025',
        'draft',
        0,
        NOW(),
        NOW()
    ) RETURNING id INTO test_request_id;
    
    RAISE NOTICE 'Создан тестовый pool request: %', test_request_id;
    
    -- ТЕСТ 2.1: Валидный переход draft → submitted
    BEGIN
        UPDATE purchase_pool_requests SET status = 'submitted' WHERE id = test_request_id;
        RAISE NOTICE '✅ ТЕСТ 2.1 ПРОЙДЕН: draft → submitted (валидный)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ТЕСТ 2.1 ПРОВАЛЕН: draft → submitted должен быть валидным. Ошибка: %', SQLERRM;
    END;
    
    -- ТЕСТ 2.2: Валидный переход submitted → matching
    BEGIN
        UPDATE purchase_pool_requests SET status = 'matching' WHERE id = test_request_id;
        RAISE NOTICE '✅ ТЕСТ 2.2 ПРОЙДЕН: submitted → matching (валидный)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ТЕСТ 2.2 ПРОВАЛЕН: submitted → matching должен быть валидным. Ошибка: %', SQLERRM;
    END;
    
    -- ТЕСТ 2.3: Невалидный переход matching → draft (должен быть заблокирован)
    BEGIN
        UPDATE purchase_pool_requests SET status = 'draft' WHERE id = test_request_id;
        RAISE NOTICE '❌ ТЕСТ 2.3 ПРОВАЛЕН: matching → draft должен быть заблокирован, но прошел!';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%Invalid pool request status transition%' THEN
            RAISE NOTICE '✅ ТЕСТ 2.3 ПРОЙДЕН: matching → draft заблокирован (как и ожидалось)';
        ELSE
            RAISE NOTICE '⚠️ ТЕСТ 2.3: Неожиданная ошибка: %', SQLERRM;
        END IF;
    END;
    
    -- ТЕСТ 2.4: Валидный переход matching → fulfilled
    BEGIN
        UPDATE purchase_pool_requests SET status = 'fulfilled' WHERE id = test_request_id;
        RAISE NOTICE '✅ ТЕСТ 2.4 ПРОЙДЕН: matching → fulfilled (валидный)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ТЕСТ 2.4 ПРОВАЛЕН: matching → fulfilled должен быть валидным. Ошибка: %', SQLERRM;
    END;
    
    -- ТЕСТ 2.5: Валидный переход fulfilled → closed
    BEGIN
        UPDATE purchase_pool_requests SET status = 'closed' WHERE id = test_request_id;
        RAISE NOTICE '✅ ТЕСТ 2.5 ПРОЙДЕН: fulfilled → closed (валидный)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ТЕСТ 2.5 ПРОВАЛЕН: fulfilled → closed должен быть валидным. Ошибка: %', SQLERRM;
    END;
    
    -- Удалить тестовый request
    DELETE FROM purchase_pool_requests WHERE id = test_request_id;
    RAISE NOTICE 'Тестовый pool request удален';
    
END $$;

-- ============================================================================
-- ИТОГОВАЯ СВОДКА
-- ============================================================================

SELECT 
    '=== ТЕСТИРОВАНИЕ FSM ТРИГГЕРОВ ЗАВЕРШЕНО ===' as summary;

