import { CountryLoader } from '../etl/loader';
import { ConsoleLogger } from '../utils/logging/consoleLogger';
import { Pool } from 'pg';
import { config } from '../config';
import { TransformedCountry } from '../types/country';

// Mock dependencies
jest.mock('pg', () => {
  const mockClient = {
    query: jest.fn(),
    release: jest.fn()
  };
  
  const mockPool = {
    connect: jest.fn().mockResolvedValue(mockClient)
  };
  
  return {
    Pool: jest.fn(() => mockPool)
  };
});

jest.mock('../config', () => ({
  config: {
    databaseUrl: 'mock-db-url',
    nodeEnv: 'development'
  }
}));

jest.mock('../utils/logging/consoleLogger', () => ({
  ConsoleLogger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn()
  }))
}));

describe('CountryLoader', () => {
  let loader: CountryLoader;
  let mockPool: any;
  let mockClient: any;
  let mockLogger: jest.Mocked<ConsoleLogger>;
  
  const transformedCountries: TransformedCountry[] = [
    {
      name: 'Germany',
      officialName: 'Federal Republic of Germany',
      capital: 'Berlin',
      region: 'Europe',
      subregion: 'Western Europe',
      population: 83240525,
      area: 357114,
      populationDensity: 233.09,
      currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
      languages: [{ code: 'deu', name: 'German' }],
      rawData: '{"name":{"common":"Germany","official":"Federal Republic of Germany"}}'
    },
    {
      name: 'France',
      officialName: 'French Republic',
      capital: 'Paris',
      region: 'Europe',
      subregion: 'Western Europe',
      population: 67391582,
      area: 551695,
      populationDensity: 122.15,
      currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
      languages: [{ code: 'fra', name: 'French' }],
      rawData: '{"name":{"common":"France","official":"French Republic"}}'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mock instances
    mockLogger = new ConsoleLogger() as jest.Mocked<ConsoleLogger>;
    
    // Get reference to Pool mock
    mockPool = (Pool as jest.MockedClass<typeof Pool>).mock.results[0]?.value;
    if (!mockPool) {
      // If the Pool hasn't been instantiated yet in the tests
      const poolConstructor = Pool as jest.MockedClass<typeof Pool>;
      new poolConstructor(); // Create an instance
      mockPool = poolConstructor.mock.results[0].value;
    }
    
    mockClient = mockPool.connect.mock.results[0]?.value;
    if (!mockClient) {
      // If connect hasn't been called yet
      mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };
      mockPool.connect.mockResolvedValue(mockClient);
    }
    
    // Configure mock responses
    mockClient.query.mockImplementation((query: string, params?: any[]) => {
      if (query.includes('INSERT INTO countries')) {
        return Promise.resolve({ rows: [{ id: 1 }] });
      }
      return Promise.resolve({ rows: [] });
    });
    
    loader = new CountryLoader();
  });

  it('should successfully load transformed data into the database', async () => {
    // Act
    await loader.load(transformedCountries);

    // Assert
    // Check transaction was started
    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    
    // Check data was truncated
    expect(mockClient.query).toHaveBeenCalledWith('TRUNCATE countries CASCADE');
    
    // Check countries were inserted
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO countries'),
      expect.arrayContaining([transformedCountries[0].name])
    );
    
    // Check currencies were inserted
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO country_currencies'),
      expect.arrayContaining(['EUR'])
    );
    
    // Check languages were inserted
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO country_languages'),
      expect.arrayContaining(['deu'])
    );
    
    // Check transaction was committed
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    
    // Check client was released
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('should rollback transaction on error', async () => {
    // Arrange
    const errorMessage = 'Database error';
    
    // Make the second query fail (after BEGIN)
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN succeeds
      .mockRejectedValueOnce(new Error(errorMessage)); // TRUNCATE fails
    
    // Act & Assert
    await expect(loader.load(transformedCountries)).rejects.toThrow('Failed to load countries data to database');
    
    // Check rollback was called
    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    
    // Check error was logged
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('should handle empty data array gracefully', async () => {
    // Act
    await loader.load([]);
    
    // Assert
    // Transaction should still start and commit
    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('TRUNCATE countries CASCADE');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    
    // But no country inserts should happen
    expect(mockClient.query).not.toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO country_currencies'),
      expect.anything()
    );
  });
  
  it('should create the correct database pool with SSL settings', () => {
    // Assert
    expect(Pool).toHaveBeenCalledWith({
      connectionString: config.databaseUrl,
      ssl: false // Since nodeEnv is 'development' in our mock
    });
  });
  
  it('should create the correct database pool with SSL in production', () => {
    // Arrange
    jest.resetModules();
    
    // Mock config to return production environment
    jest.mock('../config', () => ({
      config: {
        databaseUrl: 'mock-db-url',
        nodeEnv: 'production'
      }
    }));
    
    // Re-import to get fresh module with new config
    const { CountryLoader } = require('../etl/loader');
    
    // Act
    new CountryLoader();
    
    // Assert
    expect(Pool).toHaveBeenLastCalledWith({
      connectionString: 'mock-db-url',
      ssl: { rejectUnauthorized: false }
    });
  });
});