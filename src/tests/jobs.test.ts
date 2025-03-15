import cron from 'node-cron';
import { setupETLScheduler, runETLJob } from '../scheduler/jobs';
import { ETLPipeline } from '../etl/pipeline';
import { config } from '../config';
import { ConsoleLogger } from '../utils/logging/consoleLogger';

// Mock dependencies
jest.mock('node-cron', () => ({
  validate: jest.fn(),
  schedule: jest.fn()
}));

jest.mock('../etl/pipeline');
jest.mock('../config', () => ({
  config: {
    etlCronSchedule: '*/30 * * * *' // Every 30 minutes
  }
}));

jest.mock('../utils/logging/consoleLogger', () => ({
  ConsoleLogger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn()
  }))
}));

describe('ETL Scheduler', () => {
  let mockEtlPipeline: jest.Mocked<ETLPipeline>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mocks
    mockEtlPipeline = new ETLPipeline() as jest.Mocked<ETLPipeline>;
    (ETLPipeline as jest.MockedClass<typeof ETLPipeline>)
      .mockImplementation(() => mockEtlPipeline);
    
    mockEtlPipeline.run = jest.fn().mockResolvedValue(undefined);
    
    // Mock node-cron behaviors
    (cron.validate as jest.Mock).mockReturnValue(true);
  });
  
  describe('setupETLScheduler', () => {
    it('should set up a scheduled job with the configured cron schedule', () => {
      // Act
      setupETLScheduler();
      
      // Assert
      expect(cron.validate).toHaveBeenCalledWith(config.etlCronSchedule);
      expect(cron.schedule).toHaveBeenCalledWith(
        config.etlCronSchedule,
        expect.any(Function)
      );
    });
    
    it('should use default schedule if configuration is invalid', () => {
      // Arrange
      (cron.validate as jest.Mock).mockReturnValueOnce(false);
      
      // Act
      setupETLScheduler();
      
      // Assert
      expect(cron.schedule).toHaveBeenCalledWith(
        '0 0 * * *', // Default schedule (midnight)
        expect.any(Function)
      );
    });
    
    it('should execute ETL pipeline when scheduled function is called', async () => {
      // Arrange
      setupETLScheduler();
      
      // Get the callback function passed to cron.schedule
      const scheduledCallback = (cron.schedule as jest.Mock).mock.calls[0][1];
      
      // Act
      await scheduledCallback();
      
      // Assert
      expect(mockEtlPipeline.run).toHaveBeenCalledTimes(1);
    });
    
    it('should handle errors in the scheduled ETL job', async () => {
      // Arrange
      const errorMessage = 'Scheduled ETL error';
      mockEtlPipeline.run.mockRejectedValueOnce(new Error(errorMessage));
      
      setupETLScheduler();
      
      // Get the callback function passed to cron.schedule
      const scheduledCallback = (cron.schedule as jest.Mock).mock.calls[0][1];
      
      // Act
      await scheduledCallback();
      
      // Assert
      expect(mockEtlPipeline.run).toHaveBeenCalledTimes(1);
      // The job should not throw an error, but log it instead
      // We're mostly checking that it doesn't throw an unhandled exception
    });
  });
  
  describe('runETLJob', () => {
    it('should execute the ETL pipeline immediately', async () => {
      // Act
      const result = await runETLJob();
      
      // Assert
      expect(mockEtlPipeline.run).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });
    
    it('should return false if the ETL pipeline fails', async () => {
      // Arrange
      mockEtlPipeline.run.mockRejectedValueOnce(new Error('ETL failed'));
      
      // Act
      const result = await runETLJob();
      
      // Assert
      expect(mockEtlPipeline.run).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
  });
});