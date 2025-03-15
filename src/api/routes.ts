import express from 'express';
import { CountryController } from '../api/controllers';

const router = express.Router();

router.get('/data', CountryController.getAllCountries);
router.get('/data/:id', CountryController.getCountryById);
router.post('/etl/run', CountryController.runETLManually);

export default router;
