-- Migration: Add User Demographics Fields
-- Description: Add gender, birthDate, country, region, city fields to users table
-- Date: 2026-01-11
-- Priority: P0
-- Related: operations-data-requirements.md#45

-- 1. Create Gender enum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY', 'UNKNOWN');

-- 2. Add demographics fields to users table
ALTER TABLE users
  ADD COLUMN gender "Gender" DEFAULT 'UNKNOWN',
  ADD COLUMN birth_date DATE,
  ADD COLUMN country VARCHAR(50),
  ADD COLUMN region VARCHAR(100),
  ADD COLUMN city VARCHAR(100),
  ADD COLUMN timezone VARCHAR(50),
  ADD COLUMN profile_source VARCHAR(20),
  ADD COLUMN profile_consent BOOLEAN DEFAULT false;

-- 3. Add comments for documentation
COMMENT ON COLUMN users.gender IS '用户性别';
COMMENT ON COLUMN users.birth_date IS '用户出生日期';
COMMENT ON COLUMN users.country IS '国家（如：China, United States）';
COMMENT ON COLUMN users.region IS '省份/州（如：北京市, California）';
COMMENT ON COLUMN users.city IS '城市（如：北京, San Francisco）';
COMMENT ON COLUMN users.timezone IS '时区（如：Asia/Shanghai, America/Los_Angeles）';
COMMENT ON COLUMN users.profile_source IS '画像数据来源：USER_INPUT（用户输入）, DEVICE（设备推断）, INFERRED（算法推断）';
COMMENT ON COLUMN users.profile_consent IS '用户是否同意使用画像数据进行运营分析';

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender) WHERE gender IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_birth_date ON users(birth_date) WHERE birth_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_region ON users(region) WHERE region IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city) WHERE city IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_gender_active ON users(gender, last_active_at);
CREATE INDEX IF NOT EXISTS idx_users_country_active ON users(country, last_active_at);

-- 5. Create demographics stats table (for pre-computed data)
CREATE TABLE IF NOT EXISTS user_demographics_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  dimension VARCHAR(20) NOT NULL, -- 'gender', 'age', 'country', 'region', 'city'
  dimension_value VARCHAR(100) NOT NULL,

  -- Metrics
  user_count INT NOT NULL DEFAULT 0,
  dau INT NOT NULL DEFAULT 0,
  mau INT NOT NULL DEFAULT 0,
  paid_users INT NOT NULL DEFAULT 0,
  total_revenue_cents BIGINT NOT NULL DEFAULT 0,

  -- Calculated fields
  percentage NUMERIC(5, 2),
  conversion_rate NUMERIC(5, 2),
  arpu NUMERIC(10, 2),

  -- Metadata
  calculated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(date, dimension, dimension_value)
);

CREATE INDEX idx_demographics_stats_date ON user_demographics_stats(date);
CREATE INDEX idx_demographics_stats_dimension ON user_demographics_stats(dimension);
CREATE INDEX idx_demographics_stats_date_dimension ON user_demographics_stats(date, dimension);

COMMENT ON TABLE user_demographics_stats IS '用户画像统计预计算表';

-- 6. Rollback script (for reference, comment out in production)
/*
-- To rollback this migration:
DROP INDEX IF EXISTS idx_demographics_stats_date_dimension;
DROP INDEX IF EXISTS idx_demographics_stats_dimension;
DROP INDEX IF EXISTS idx_demographics_stats_date;
DROP TABLE IF EXISTS user_demographics_stats;

DROP INDEX IF EXISTS idx_users_country_active;
DROP INDEX IF EXISTS idx_users_gender_active;
DROP INDEX IF EXISTS idx_users_city;
DROP INDEX IF EXISTS idx_users_region;
DROP INDEX IF EXISTS idx_users_country;
DROP INDEX IF EXISTS idx_users_birth_date;
DROP INDEX IF EXISTS idx_users_gender;

ALTER TABLE users
  DROP COLUMN IF EXISTS profile_consent,
  DROP COLUMN IF EXISTS profile_source,
  DROP COLUMN IF EXISTS timezone,
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS region,
  DROP COLUMN IF EXISTS country,
  DROP COLUMN IF EXISTS birth_date,
  DROP COLUMN IF EXISTS gender;

DROP TYPE IF EXISTS "Gender";
*/
