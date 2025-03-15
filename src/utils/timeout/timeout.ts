export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  operationName: string = 'operation'
): Promise<T> {
  // Create a timeout promise that rejects after timeoutMs
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout: ${operationName} exceeded ${timeoutMs}ms`));
    }, timeoutMs);
  });

  // Race the original promise against the timeout
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Sets the default statement timeout for PostgreSQL queries
 * @param client PostgreSQL client
 * @param timeoutMs Timeout in milliseconds
 */
export async function setDatabaseTimeout(client: any, timeoutMs: number = 30000): Promise<void> {
  await client.query(`SET statement_timeout TO ${timeoutMs}`);
}
