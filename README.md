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
## Project Structure
├── src/
│   ├── api/               # API components
│   │   ├── controllers.ts # Request handlers
│   │   ├── routes.ts      # API route definitions
│   ├── config/            # Configuration files
│   │   ├── config.ts      # App settings
│   ├── db/                # Database components
│   │   ├── connection.ts  # Database connection
│   ├── etl/               # ETL pipeline components
│   │   ├── extractor.ts   # Data extraction
│   │   ├── transformer.ts # Data transformation
│   │   ├── loader.ts      # Database loading
│   │   ├── pipeline.ts    # ETL orchestration
│   ├── middleware/        # Express middleware
│   │   ├── validateRequest.ts  # Request validation middleware
│   ├── repositories/      # Database interaction layer
│   │   ├── countryRepository.ts # Country-specific queries
│   ├── scheduler/         # Scheduled tasks
│   │   ├── jobs.ts        # Cron job definitions
│   ├── services/          # Business logic
│   │   ├── countryService.ts  # Country service layer
│   ├── types/             # TypeScript types
│   │   ├── country.ts     # Country data types
│   ├── utils/             # Utility functions
│   │   ├── logging/       # Logging system
│   │   │   ├── consoleLogger.ts # Console logger
│   │   │   ├── logger.ts        # Generic logger
│   │   ├── pagination/    # Pagination helper
│   │   │   ├── pagination.ts  # Pagination logic
│   ├── validations/       # Request validation
│   │   ├── countryValidation.ts  # Country API validation
│   │   ├── etlValidation.ts      # ETL process validation
│   ├── index.ts           # Application entry point
├── .env                   # Environment variables
├── .eslintrc.js           # ESLint configuration
├── .gitignore             # Git ignored files
├── .prettierrc            # Prettier configuration
├── newrelic.cjs           # NewRelic monitoring
├── newrelic_agent.log      # NewRelic logs
├── instrument.js          # Instrumentation scripts
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project dependencies
├── package-lock.json      # Dependency lock file
└── README.md              # Project documentation

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- PostgreSQL database
- Git

### Installation

1. Clone the repository
git clone https://github.com/SaaKho/GGI-Backend.git
cd Backend
npm run dev

2. Install dependencies
npm install 

3. Create and configure the `.env` file
--You can ask for the .env to get access but it is advised to Update the `.env` file with your database credentials and other configuration options:

API Configuration
COUNTRIES_API_URL=https://restcountries.com/v3.1/all

4. Create the PostgreSQL database
Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=[database name]
DB_USER=postgres
DB_PASSWORD=[your password]
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/countries_db

API Server Configuration
PORT=3000
NODE_ENV=development

5. Build the TypeScript code
npm run build

### Running the Application

Start the application:
npm start

For development with auto-reload:
npm run dev






