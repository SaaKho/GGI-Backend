import express from 'express';
import { CountryController } from '../api/controllers';
import { validateRequest } from '../middleware/validateRequest';
import { getAllCountriesSchema, getCountryByIdSchema } from '../validation/countryValidation';
import { runETLJobSchema } from '../validation/etlValidation';

const router = express.Router();

// Apply validation middleware
router.get('/data', validateRequest(getAllCountriesSchema), CountryController.getAllCountries);
router.get('/data/:id', validateRequest(getCountryByIdSchema), CountryController.getCountryById);
router.post('/etl/run', validateRequest(runETLJobSchema), CountryController.runETLManually);

export default router;
