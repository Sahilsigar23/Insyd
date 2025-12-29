-- Migration: Add DAMAGE type to stock_movements
-- Run this if you already have the stock_movements table created

-- Drop the old constraint
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_type_check;

-- Add the new constraint with DAMAGE included
ALTER TABLE stock_movements ADD CONSTRAINT stock_movements_type_check 
  CHECK (type IN ('PURCHASE', 'SALE', 'DAMAGE'));

