-- Add new values to batch_status enum
ALTER TYPE batch_status ADD VALUE IF NOT EXISTS 'draft' BEFORE 'forecast';
ALTER TYPE batch_status ADD VALUE IF NOT EXISTS 'matched' AFTER 'confirmed';
ALTER TYPE batch_status ADD VALUE IF NOT EXISTS 'closed' AFTER 'matched';

-- Note: 'delivered' status will remain for backwards compatibility but should not be used for new batches