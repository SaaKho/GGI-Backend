import { Pool } from 'pg';
import { TransformedCountry, Currency, Language } from '../types/country';
import { config } from '../config';
import { ConsoleLogger } from '../utils/logging/consoleLogger';
import { withRetry } from '../utils/retry/retry';
import { withTimeout, setDatabaseTimeout } from '../utils/timeout/timeout';

export class CountryLoader {
  private pool: Pool;
  private logger: ConsoleLogger;

  constructor() {
    this.pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    });
    this.logger = new ConsoleLogger();
  }

  async load(transformedCountries: TransformedCountry[]): Promise<void> {
    this.logger.log(`Loading ${transformedCountries.length} countries to database`);

    const client = await this.pool.connect();

    try {
      // Set database timeout
      await setDatabaseTimeout(client, 30000);
      
      // Begin transaction
      await client.query('BEGIN');

      // Clear existing data with retry and timeout
      await withRetry(
        () => withTimeout(
          client.query('TRUNCATE countries CASCADE'),
          10000,
          'truncate countries table'
        ),
        'truncate operation',
        3
      );

      // Insert countries
      for (const country of transformedCountries) {
        const { rows } = await withRetry(
          () => withTimeout(
            client.query(
              `INSERT INTO countries 
               (name, official_name, capital, region, subregion, population, area, population_density, raw_data) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
               RETURNING id`,
              [
                country.name,
                country.officialName,
                country.capital,
                country.region,
                country.subregion,
                country.population,
                country.area,
                country.populationDensity,
                country.rawData,
              ]
            ),
            15000,
            `insert country ${country.name}`
          ),
          `insert country ${country.name}`,
          2
        );

        const countryId = rows[0].id;

        // Insert currencies
        for (const currency of country.currencies) {
          await withRetry(
            () => client.query(
              `INSERT INTO country_currencies (country_id, code, name, symbol) 
               VALUES ($1, $2, $3, $4)`,
              [countryId, currency.code, currency.name, currency.symbol]
            ),
            `insert currency ${currency.code}`
          );
        }

        // Insert languages
        for (const language of country.languages) {
          await withRetry(
            () => client.query(
              `INSERT INTO country_languages (country_id, code, name) 
               VALUES ($1, $2, $3)`,
              [countryId, language.code, language.name]
            ),
            `insert language ${language.code}`
          );
        }
      }

      // Commit transaction
      await client.query('COMMIT');
      this.logger.log('Data loaded successfully');
    } catch (error: any) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      this.logger.error(`Error loading data to database: ${error.message}`);
      throw new Error('Failed to load countries data to database');
    } finally {
      client.release();
    }
  }
}