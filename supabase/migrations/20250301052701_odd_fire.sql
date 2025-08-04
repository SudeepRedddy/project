/*
  # Add blockchain integration fields to certificates table

  1. Changes
    - Add `blockchain_tx_hash` column to store Ethereum transaction hash
    - Add `blockchain_verified` boolean column to track blockchain verification status
  
  2. Indexes
    - Add index on blockchain_tx_hash for faster lookups
*/

-- Add blockchain transaction hash column
ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS blockchain_tx_hash text;

-- Add blockchain verification status column
ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS blockchain_verified boolean DEFAULT false;

-- Add index for blockchain transaction hash
CREATE INDEX IF NOT EXISTS idx_certificates_blockchain_tx_hash 
ON certificates(blockchain_tx_hash);