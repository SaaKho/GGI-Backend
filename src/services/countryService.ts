import { pool } from '../db/connection';
import { ConsoleLogger } from '../utils/logging/consoleLogger';
import { Pagination } from '../utils/Pagination/pagination';

const logger = new ConsoleLogger();

export class CountryService {
  /**
   * Fetch all countries with optional filtering and pagination
   */
  static async getAllCountries(filter?: string, page: number = 1, limit: number = 10) {
    logger.log(
      `Fetching countries with filter: ${filter || 'none'}, page: ${page}, limit: ${limit}`
    );

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) FROM countries c 
      ${filter ? 'WHERE c.name ILIKE $1 OR c.official_name ILIKE $1 OR c.region ILIKE $1 OR c.subregion ILIKE $1' : ''}
    `;
    const countResult = await pool.query(countQuery, filter ? [`%${filter}%`] : []);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    // Use Pagination class
    const pagination = Pagination.calculatePagination(page, limit, totalCount);

    const queryParams: any[] = [];
    let query = `
      SELECT 
        c.id, 
        c.name, 
        c.official_name as "officialName", 
        c.capital, 
        c.region, 
        c.subregion, 
        c.population, 
        c.area, 
        c.population_density as "populationDensity",
        c.flag_url as "flagUrl",
        (
          SELECT json_agg(json_build_object('code', cc.code, 'name', cc.name, 'symbol', cc.symbol)) 
          FROM country_currencies cc WHERE cc.country_id = c.id
        ) as currencies,
        (
          SELECT json_agg(json_build_object('code', cl.code, 'name', cl.name)) 
          FROM country_languages cl WHERE cl.country_id = c.id
        ) as languages
      FROM countries c
    `;

    if (filter) {
      query += ` WHERE c.name ILIKE $1 OR c.official_name ILIKE $1 OR c.region ILIKE $1 OR c.subregion ILIKE $1`;
      queryParams.push(`%${filter}%`);
    }

    // Add pagination
    query += ` ORDER BY c.name LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(pagination.limit, pagination.offset);

    // Execute query
    const result = await pool.query(query, queryParams);
    logger.log(`Fetched ${result.rows.length} countries from the database`);

    return {
      data: result.rows,
      meta: pagination,
    };
  }

  /**
   * Fetch a single country by ID
   */
  static async getCountryById(id: number) {
    if (isNaN(id)) {
      throw new Error('Invalid ID parameter');
    }

    logger.log(`Fetching country with ID: ${id}`);

    const query = `
      SELECT 
        c.id, 
        c.name, 
        c.official_name as "officialName", 
        c.capital, 
        c.region, 
        c.subregion, 
        c.population, 
        c.area, 
        c.population_density as "populationDensity",
        c.flag_url as "flagUrl",
        (
          SELECT json_agg(json_build_object('code', cc.code, 'name', cc.name, 'symbol', cc.symbol)) 
          FROM country_currencies cc WHERE cc.country_id = c.id
        ) as currencies,
        (
          SELECT json_agg(json_build_object('code', cl.code, 'name', cl.name)) 
          FROM country_languages cl WHERE cl.country_id = c.id
        ) as languages
      FROM countries c
      WHERE c.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new Error(`Country with ID ${id} not found`);
    }

    return result.rows[0];
  }
}
