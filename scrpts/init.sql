DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS Transactions;
DROP TABLE IF EXISTS Branch;

-- Drop types if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'us_state') THEN
        DROP TYPE us_state;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'branch') THEN
        DROP TYPE branch;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_cat') THEN
        DROP TYPE transaction_cat;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_stat') THEN
        DROP TYPE transaction_stat;
    END IF;
END $$;

CREATE TYPE us_state AS ENUM('AZ', 'CA', 'WA', 'NY', 'TX');
CREATE TYPE transaction_cat AS ENUM('USER_USER', 'DEPOSIT', 'WITHDRAWAL', 'CREDIT_REPAYMENT', 'FD_EXPIRY', 'FD_BREAK');
CREATE TYPE transaction_stat AS ENUM('INITIATED', 'FAILED', 'SENT', 'COMPLETE');

CREATE TABLE Branch (
  branch_id VARCHAR(255) PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  balance DECIMAL(15, 2) NOT NULL
);

CREATE TABLE Customers (
  customer_id VARCHAR(255) PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  middle_name VARCHAR(255),
  last_name VARCHAR(255) NOT NULL,
  loc TEXT,
  pinCode INT,
  st us_state,
  credit_limit DECIMAL(15, 2),
  credit_usage DECIMAL(15, 2),
  credit_score INT,
  registration_time TIMESTAMP,
  branch_id VARCHAR(255),
  balance DECIMAL(15, 2),
  FOREIGN KEY (branch_id) REFERENCES Branch(branch_id)
);

CREATE TABLE Transactions (
  transaction_id VARCHAR(255) PRIMARY KEY,
  from_id VARCHAR(255),
  to_id VARCHAR(255),
  cat transaction_cat,
  amount DECIMAL(15, 2),
  timestamp_init TIMESTAMP,
  stat transaction_stat,
  timestamp_complete TIMESTAMP,
  FOREIGN KEY (from_id) REFERENCES Customers(customer_id) ON DELETE SET NULL,
  FOREIGN KEY (to_id) REFERENCES Customers(customer_id) ON DELETE SET NULL,
  FOREIGN KEY (from_id) REFERENCES Branch(branch_id) ON DELETE SET NULL,
  FOREIGN KEY (to_id) REFERENCES Branch(branch_id) ON DELETE SET NULL
);