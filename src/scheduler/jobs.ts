import cron from 'node-cron';
import { config } from '../config';
import { ETLPipeline } from '../etl/pipeline';
import { ConsoleLogger } from '../utils/logging/consoleLogger';

const logger = new ConsoleLogger();

/**
 * Sets up the scheduled ETL job using node-cron
 */
export function setupETLScheduler(): void {
  // Get the cron schedule from config
  let cronSchedule = config.etlCronSchedule || '0 0 * * *';

  // Validate the cron expression
  if (!cron.validate(cronSchedule)) {
    logger.error(`Invalid cron schedule: ${cronSchedule}`);
    logger.error('Falling back to default schedule: daily at midnight (0 0 * * *)');
    cronSchedule = '0 0 * * *';
  }

  logger.log(`Setting up ETL scheduler with cron schedule: ${cronSchedule}`);

  // Create ETL pipeline instance
  const etlPipeline = new ETLPipeline();

  // Schedule the ETL job
  cron.schedule(cronSchedule, async () => {
    logger.log(`[${new Date().toISOString()}] Running scheduled ETL job...`);

    try {
      await etlPipeline.run();
      logger.log(`[${new Date().toISOString()}] Scheduled ETL job completed successfully`);
    } catch (error) {
      logger.error(`[${new Date().toISOString()}] Scheduled ETL job failed: ${error}`);
    }
  });

  logger.log('ETL scheduler setup complete');
}

/**
 * Runs the ETL job immediately (on-demand)
 * This can be used for manual triggers or API endpoints
 */
export async function runETLJob(): Promise<boolean> {
  logger.log(`[${new Date().toISOString()}] Running on-demand ETL job...`);

  try {
    const etlPipeline = new ETLPipeline();
    await etlPipeline.run();
    logger.log(`[${new Date().toISOString()}] On-demand ETL job completed successfully`);
    return true;
  } catch (error) {
    logger.error(`[${new Date().toISOString()}] On-demand ETL job failed: ${error}`);
    return false;
  }
}
