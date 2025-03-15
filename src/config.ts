import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET?.trim() || 'supersecretkey',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || '1h',
  countriesApiUrl: process.env.COUNTRIES_API_URL,
  etlCronSchedule: process.env.ETL_CRON_SCHEDULE,
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
  newRelic: {
    appName: process.env.NEW_RELIC_APP_NAME?.trim() || 'default-app',
    licenseKey: process.env.NEW_RELIC_LICENSE_KEY?.trim() || '',
    distributedTracing: process.env.NEW_RELIC_DISTRIBUTED_TRACING_ENABLED === 'true',
  },
};

export const isProduction = config.nodeEnv === 'production';
