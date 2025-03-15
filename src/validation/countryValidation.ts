import { z } from 'zod';

/**
 * Validation for fetching all countries
 */
export const getAllCountriesSchema = z.object({
  filter: z.string().optional(),
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a number')
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 1)), // Convert to number
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a number')
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10)), // Convert to number
});

/**
 * Validation for fetching a country by ID
 */
export const getCountryByIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(val => parseInt(val, 10)), // Convert to number
});
