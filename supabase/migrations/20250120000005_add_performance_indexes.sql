-- Performance Indexes Migration
-- Adds indexes for frequently queried columns to improve query performance

-- BATCHES table indexes
-- Status is frequently filtered in queries
CREATE INDEX IF NOT EXISTS idx_batches_status ON public.batches(status);

-- Farmer ID is used in many queries (RLS, filtering)
CREATE INDEX IF NOT EXISTS idx_batches_farmer_id ON public.batches(farmer_id);

-- Created at for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_batches_created_at ON public.batches(created_at DESC);

-- Grade is frequently filtered
CREATE INDEX IF NOT EXISTS idx_batches_grade ON public.batches(grade) WHERE grade IS NOT NULL;

-- Target week for filtering by delivery period
CREATE INDEX IF NOT EXISTS idx_batches_target_week ON public.batches(target_week);

-- POOL REQUESTS table indexes
-- Status is frequently filtered
CREATE INDEX IF NOT EXISTS idx_pool_requests_status ON public.purchase_pool_requests(status);

-- MPK ID for filtering by MPK
CREATE INDEX IF NOT EXISTS idx_pool_requests_mpk_id ON public.purchase_pool_requests(mpk_id);

-- Target week for filtering
CREATE INDEX IF NOT EXISTS idx_pool_requests_target_week ON public.purchase_pool_requests(target_week);

-- Created at for sorting
CREATE INDEX IF NOT EXISTS idx_pool_requests_created_at ON public.purchase_pool_requests(created_at DESC);

-- MATCHING WINDOWS table indexes
-- Start date for finding current/upcoming windows
CREATE INDEX IF NOT EXISTS idx_matching_windows_start_date ON public.matching_windows(start_date);

-- Lock date for countdown calculations
CREATE INDEX IF NOT EXISTS idx_matching_windows_lock_date ON public.matching_windows(lock_date);

-- Status (though we use computed status, DB status is still queried)
CREATE INDEX IF NOT EXISTS idx_matching_windows_status ON public.matching_windows(status);

-- POOL MATCHES table indexes (already has some, adding missing ones)
-- Matching window ID for filtering by window
CREATE INDEX IF NOT EXISTS idx_pool_matches_window_id ON public.pool_matches(matching_window_id) WHERE matching_window_id IS NOT NULL;

-- Batch ID for reverse lookups
CREATE INDEX IF NOT EXISTS idx_pool_matches_batch_id ON public.pool_matches(batch_id);

-- Request ID for filtering by request
CREATE INDEX IF NOT EXISTS idx_pool_matches_request_id ON public.pool_matches(request_id);

-- Created at for sorting
CREATE INDEX IF NOT EXISTS idx_pool_matches_created_at ON public.pool_matches(created_at DESC);

-- EXECUTIONS table indexes
-- Match ID for joining with matches
CREATE INDEX IF NOT EXISTS idx_executions_match_id ON public.offtake_executions(match_id) WHERE match_id IS NOT NULL;

-- Status for filtering
CREATE INDEX IF NOT EXISTS idx_executions_status ON public.offtake_executions(status);

-- Created at for sorting
CREATE INDEX IF NOT EXISTS idx_executions_created_at ON public.offtake_executions(created_at DESC);

-- FARMERS table indexes
-- Grading for filtering by supplier tier
CREATE INDEX IF NOT EXISTS idx_farmers_grading ON public.farmers(grading) WHERE grading IS NOT NULL;

-- Registration status for filtering active farmers
CREATE INDEX IF NOT EXISTS idx_farmers_registration_status ON public.farmers(registration_status);

-- MPKS table indexes
-- Registration status for filtering active MPKs
CREATE INDEX IF NOT EXISTS idx_mpks_registration_status ON public.mpks(registration_status);

-- ACTIVITY LOGS indexes (composite for common queries)
-- Event type + created at for filtering by type and time
CREATE INDEX IF NOT EXISTS idx_activity_log_event_created ON public.activity_log(event_type, created_at DESC);

-- Actor role + created at for filtering by role and time
CREATE INDEX IF NOT EXISTS idx_activity_log_actor_created ON public.activity_log(actor_role, created_at DESC);

-- Farmer activity log - farmer ID + created at
CREATE INDEX IF NOT EXISTS idx_farmer_activity_log_farmer_created ON public.farmer_activity_log(farmer_id, created_at DESC);

-- MPK activity log - MPK ID + created at
CREATE INDEX IF NOT EXISTS idx_mpk_activity_log_mpk_created ON public.mpk_activity_log(mpk_id, created_at DESC);

-- Matching activity log - match ID + created at
CREATE INDEX IF NOT EXISTS idx_matching_activity_log_match_created ON public.matching_activity_log(match_id, created_at DESC);

-- PRICE GRID indexes
-- Active version lookup (frequently queried)
CREATE INDEX IF NOT EXISTS idx_price_grid_versions_active ON public.price_grid_versions(is_active) WHERE is_active = true;

-- Version ID for joining with cells
CREATE INDEX IF NOT EXISTS idx_price_grid_cells_version_id ON public.price_grid_cells(version_id);

-- PREMIUM SETTINGS indexes
-- Active settings lookup
CREATE INDEX IF NOT EXISTS idx_premium_settings_active ON public.premium_settings(is_active) WHERE is_active = true;

-- Premium type for filtering
CREATE INDEX IF NOT EXISTS idx_premium_settings_type ON public.premium_settings(premium_type);

-- Comments on indexes for documentation
COMMENT ON INDEX idx_batches_status IS 'Index for filtering batches by status (frequently queried)';
COMMENT ON INDEX idx_pool_requests_status IS 'Index for filtering pool requests by status';
COMMENT ON INDEX idx_matching_windows_start_date IS 'Index for finding current/upcoming matching windows';
COMMENT ON INDEX idx_pool_matches_window_id IS 'Index for filtering matches by matching window';

