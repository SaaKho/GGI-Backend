// IMPORTANT: Import instrument.js at the very top
require('../instrument.js');

// Then your other imports
import 'newrelic';
import express, { Request, Response, NextFunction } from 'express';
import { config } from './config';
import { initializeDatabase, testConnection } from './db/connection';
import countryRoutes from './api/routes';
import { setupETLScheduler } from './scheduler/jobs';
import { ETLPipeline } from './etl/pipeline';

const app = express();
app.use(express.json());

// Add root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to GGI Backend' });
});

app.use('/api', countryRoutes);

// Start function
async function start() {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Unable to connect to the database. Exiting...');
      process.exit(1);
    }

    // Initialize database (create tables)
    await initializeDatabase();

    // Run initial ETL job (optional)
    const etlPipeline = new ETLPipeline();
    try {
      console.log('Running initial ETL job...');
      await etlPipeline.run();
      console.log('Initial ETL job completed');
    } catch (error) {
      console.error('Initial ETL job failed:', error);
      // Continue starting the server even if initial ETL fails
    }

    // Setup scheduled ETL job
    setupETLScheduler();

    // Start Express server
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Start the application
start();
