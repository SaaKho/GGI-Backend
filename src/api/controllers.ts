import { Request, Response } from 'express';
import { pool } from '../db/connection';
import { runETLJob } from '../scheduler/jobs';

/**
 * Get all countries with optional filtering and pagination
 * Handles:
 * - /data (all records)
 * - /data?filter=<criteria> (filtered records)
 * - /data?page=N&limit=M (paginated records)
 */
export async function getAllCountries(req: Request, res: Response): Promise<void> {
  try {
    // Get query parameters
    const filter = req.query.filter as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    
    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      res.status(400).json({ error: 'Invalid page parameter' });
      return;
    }
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      res.status(400).json({ error: 'Invalid limit parameter. Must be between 1 and 100' });
      return;
    }
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build the base query
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
          SELECT json_agg(json_build_object(
            'code', cc.code, 
            'name', cc.name, 
            'symbol', cc.symbol
          )) 
          FROM country_currencies cc 
          WHERE cc.country_id = c.id
        ) as currencies,
        (
          SELECT json_agg(json_build_object(
            'code', cl.code, 
            'name', cl.name
          )) 
          FROM country_languages cl 
          WHERE cl.country_id = c.id
        ) as languages
      FROM countries c
    `;
    
    // Add filter if provided
    const queryParams: any[] = [];
    if (filter) {
      query += ` 
        WHERE 
          c.name ILIKE $1 OR
          c.official_name ILIKE $1 OR
          c.region ILIKE $1 OR
          c.subregion ILIKE $1
      `;
      queryParams.push(`%${filter}%`);
    }
    
    // Get total count for pagination metadata
    const countQuery = `
      SELECT COUNT(*) 
      FROM countries c
      ${filter ? 'WHERE c.name ILIKE $1 OR c.official_name ILIKE $1 OR c.region ILIKE $1 OR c.subregion ILIKE $1' : ''}
    `;
    
    const countResult = await pool.query(countQuery, filter ? [`%${filter}%`] : []);
    const totalCount = parseInt(countResult.rows[0].count, 10);
    
    // Add pagination
    query += ` ORDER BY c.name LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Execute the query
    const result = await pool.query(query, queryParams);
    
    // Return the results with pagination metadata
    res.status(200).json({
      data: result.rows,
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get a single country by ID
 */
export async function getCountryById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID parameter' });
      return;
    }
    
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
          SELECT json_agg(json_build_object(
            'code', cc.code, 
            'name', cc.name, 
            'symbol', cc.symbol
          )) 
          FROM country_currencies cc 
          WHERE cc.country_id = c.id
        ) as currencies,
        (
          SELECT json_agg(json_build_object(
            'code', cl.code, 
            'name', cl.name
          )) 
          FROM country_languages cl 
          WHERE cl.country_id = c.id
        ) as languages
      FROM countries c
      WHERE c.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Country not found' });
      return;
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching country:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Manually trigger the ETL process
 */
export async function runETLManually(req: Request, res: Response): Promise<void> {
  try {
    const success = await runETLJob();
    
    if (success) {
      res.status(200).json({ message: 'ETL process started successfully' });
    } else {
      res.status(500).json({ error: 'ETL process failed' });
    }
  } catch (error) {
    console.error('Error running ETL process:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}