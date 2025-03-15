# GGI-Backend
# REST Countries ETL Pipeline

An ETL (Extract, Transform, Load) pipeline that fetches data from the REST Countries API, processes it, and exposes it through a RESTful API.

![Project Architecture](path/to/architecture-diagram.png)

## Features

- **Extract**: Fetches country data from the REST Countries API
- **Transform**: Normalizes nested fields, adds computed fields, and cleans unnecessary data
- **Load**: Stores processed data in a PostgreSQL database with an optimized schema
- **RESTful API**: Exposes endpoints for querying the data with filtering and pagination
- **Scheduled Updates**: Automatically refreshes data on a configurable schedule
- **Monitoring**: Integrated with NewRelic and Sentry for performance and error tracking

## Technology Stack

- **Backend**: Node.js with Express and TypeScript
- **Database**: PostgreSQL
- **ETL Scheduler**: node-cron
- **API Testing**: Bruno
- **Monitoring**: NewRelic, Sentry
- **Code Quality**: ESLint, Prettier

## Project Structure
