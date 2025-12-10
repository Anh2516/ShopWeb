-- Migration: Fix product price column to support values >= 100 million
-- Change DECIMAL(10,2) to DECIMAL(12,2) to support up to 9,999,999,999.99

ALTER TABLE products MODIFY COLUMN price DECIMAL(12, 2) NOT NULL;

