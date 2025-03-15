import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';

/**
 * Middleware to validate request query, params, or body
 */
export const validateRequest = (schema: ZodSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        ...req.query, // Validate query parameters
        ...req.params, // Validate route parameters
        ...req.body, // Validate request body
      });
      next();
    } catch (error: any) {
      res.status(400).json({ error: error.errors });
    }
  };
};
