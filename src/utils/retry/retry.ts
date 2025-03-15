import { ConsoleLogger } from '../../utils/logging/consoleLogger';

const logger = new ConsoleLogger();

export async function withRetry<T>(
  operation: () => Promise<T>, 
  operationName: string, 
  maxRetries: number = 3
): Promise<T> {
  let retries = 0;
  
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      if (retries >= maxRetries || !isRetryableError(error)) {
        logger.error(`Operation '${operationName}' failed after ${retries + 1} attempts: ${error.message}`);
        throw error;
      }
      
      retries++;
      logger.log(`Retrying operation '${operationName}' (${retries}/${maxRetries}): ${error.message}`);
      
      // Simple exponential backoff
      const backoffMs = 100 * Math.pow(2, retries - 1);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
}

/**
 * Checks if an error can be retried
 */
function isRetryableError(error: any): boolean {
  // Database connection errors
  if (error.code && [
    '08000', // connection exception
    '08003', // connection does not exist
    '08006', // connection failure
    '40001', // serialization failure
    '40P01'  // deadlock detected
  ].includes(error.code)) {
    return true;
  }
  
  // Timeout errors
  if (error.message && (
    error.message.includes('timeout') || 
    error.message.includes('timed out')
  )) {
    return true;
  }
  
  return false;
}