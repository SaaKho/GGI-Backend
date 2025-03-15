import { Pool } from 'pg';
import { config, isProduction } from '../config';

// Create a connection pool
export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Initialize database (create tables if they don't exist)
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        official_name VARCHAR(255) NOT NULL,
        capital VARCHAR(255),
        region VARCHAR(100) NOT NULL,
        subregion VARCHAR(100),
        population BIGINT NOT NULL,
        area NUMERIC,
        population_density NUMERIC,
        flag_url TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS country_currencies (
        id SERIAL PRIMARY KEY,
        country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
        code VARCHAR(10) NOT NULL,
        name VARCHAR(100) NOT NULL,
        symbol VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS country_languages (
        id SERIAL PRIMARY KEY,
        country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
        code VARCHAR(10) NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_countries_name ON countries(name);
      CREATE INDEX IF NOT EXISTS idx_countries_region ON countries(region);
      CREATE INDEX IF NOT EXISTS idx_country_currencies_code ON country_currencies(code);
      CREATE INDEX IF NOT EXISTS idx_country_languages_code ON country_languages(code);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  } finally {
    client.release();
  }
}
