import { Pool } from 'pg';
import { TransformedCountry, Currency, Language } from '../types/country';
import { config } from '../config';

export class CountryLoader {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    });
  }

  async load(transformedCountries: TransformedCountry[]): Promise<void> {
    console.log(`Loading ${transformedCountries.length} countries to database`);

    const client = await this.pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Clear existing data (optional - depends on your refresh strategy)
      await client.query('TRUNCATE countries CASCADE');

      // Insert countries
      for (const country of transformedCountries) {
        const { rows } = await client.query(
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
        );

        const countryId = rows[0].id;

        // Insert currencies
        for (const currency of country.currencies) {
          await client.query(
            `INSERT INTO country_currencies (country_id, code, name, symbol) 
             VALUES ($1, $2, $3, $4)`,
            [countryId, currency.code, currency.name, currency.symbol]
          );
        }

        // Insert languages
        for (const language of country.languages) {
          await client.query(
            `INSERT INTO country_languages (country_id, code, name) 
             VALUES ($1, $2, $3)`,
            [countryId, language.code, language.name]
          );
        }
      }

      // Commit transaction
      await client.query('COMMIT');
      console.log('Data loaded successfully');
    } catch (error) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      console.error('Error loading data to database:', error);
      throw new Error('Failed to load countries data to database');
    } finally {
      client.release();
    }
  }
}
