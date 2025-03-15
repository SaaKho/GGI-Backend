import { Request, Response } from 'express';
import { CountryService } from '../services/countryService';
import { runETLJob } from '../scheduler/jobs';
import { ConsoleLogger } from '../utils/logging/consoleLogger';

const logger = new ConsoleLogger();

export class CountryController {
  
  static getAllCountries = async (req: Request, res: Response): Promise<void> => {
    try {
      const { filter, page, limit } = req.query;
      const data = await CountryService.getAllCountries(
        filter as string | undefined, 
        parseInt(page as string, 10), 
        parseInt(limit as string, 10)
      );
      res.status(200).json(data);
    } catch (error:any) {
      logger.error(`Error fetching countries: ${error}`);
      res.status(500).json({ error: error.message });
    }
  };

  static getCountryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const country = await CountryService.getCountryById(id);
      res.status(200).json(country);
    } catch (error:any) {
      logger.error(`Error fetching country by ID: ${error}`);
      res.status(500).json({ error: error.message });
    }
  };

  static runETLManually = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.log('Manually triggering ETL process...');
      const success = await runETLJob();

      if (success) {
        logger.log('ETL process started successfully');
        res.status(200).json({ message: 'ETL process started successfully' });
      } else {
        logger.error('ETL process failed');
        res.status(500).json({ error: 'ETL process failed' });
      }
    } catch (error) {
      logger.error(`Error running ETL process: ${error}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
