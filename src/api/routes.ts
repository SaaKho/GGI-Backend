import express from 'express';
import { getAllCountries, getCountryById, runETLManually } from './controllers';

const router = express.Router();

// Main data endpoint - handles all records, filtering, and pagination
router.get('/data', getAllCountries);

// Get single country by ID (optional but useful)
router.get('/data/:id', getCountryById);

// Manual ETL trigger endpoint
router.post('/etl/run', runETLManually);

export default router;