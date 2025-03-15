import axios from 'axios';
import { CountryExtractor } from '../etl/extractor';
import { ConsoleLogger } from '../utils/logging/consoleLogger';
import { mockRawCountries } from './sample/countryData';

// Mock axios and logger
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../utils/logging/consoleLogger', () => ({
  ConsoleLogger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('CountryExtractor', () => {
  let extractor: CountryExtractor;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    extractor = new CountryExtractor();
  });

  it('should successfully extract data from the API', async () => {
    // Arrange
    mockedAxios.get.mockResolvedValueOnce({ data: mockRawCountries });

    // Act
    const result = await extractor.extract();

    // Assert
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('restcountries.com'));
    expect(result).toEqual(mockRawCountries);
    expect(result.length).toBe(mockRawCountries.length);
  });

  it('should handle API errors gracefully', async () => {
    // Arrange
    const errorMessage = 'Network Error';
    mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

    // Act & Assert
    await expect(extractor.extract()).rejects.toThrow();
  });

  it('should handle HTTP error responses', async () => {
    // Arrange
    const errorResponse = {
      response: {
        status: 404,
        data: { message: 'Not found' }
      }
    };
    mockedAxios.get.mockRejectedValueOnce(errorResponse);

    // Act & Assert
    await expect(extractor.extract()).rejects.toThrow();
  });

  it('should handle rate limiting', async () => {
    // Arrange
    const rateLimitResponse = {
      response: {
        status: 429,
        data: { message: 'Too Many Requests' }
      }
    };
    mockedAxios.get.mockRejectedValueOnce(rateLimitResponse);

    // Act & Assert
    await expect(extractor.extract()).rejects.toThrow();
  });
});
