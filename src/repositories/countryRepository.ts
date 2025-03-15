import { pool } from '../db/connection';

export class CountryRepository {
  static async getTotalCount(filter?: string): Promise<number> {
    const countQuery = `
      SELECT COUNT(*) FROM countries c 
      ${filter ? 'WHERE c.name ILIKE $1 OR c.official_name ILIKE $1 OR c.region ILIKE $1 OR c.subregion ILIKE $1' : ''}
    `;
    const countResult = await pool.query(countQuery, filter ? [`%${filter}%`] : []);
    return parseInt(countResult.rows[0].count, 10);
  }

  static async getAllCountries(filter: string | undefined, limit: number, offset: number) {
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

    query += ` ORDER BY c.name LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    return pool.query(query, queryParams);
  }

  static async getCountryById(id: number) {
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

    return pool.query(query, [id]);
  }
}
