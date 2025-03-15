import { CountryService } from '../services/countryService';
import { CountryRepository } from '../repositories/countryRepository';
import { ConsoleLogger } from '../utils/logging/consoleLogger';
import { Pagination } from '../utils/Pagination/pagination';

// Mock the dependencies
jest.mock('../repositories/countryRepository', () => ({
  CountryRepository: {
    getTotalCount: jest.fn().mockResolvedValue(2),
    getAllCountries: jest.fn().mockResolvedValue({
      rows: [
        {
          id: 1,
          name: 'Germany',
          official_name: 'Federal Republic of Germany',
          capital: 'Berlin',
          region: 'Europe',
          subregion: 'Western Europe',
          population: 83240525,
          area: 357114,
          population_density: 233.09,
          currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
          languages: [{ code: 'deu', name: 'German' }],
        },
        {
          id: 2,
          name: 'France',
          official_name: 'French Republic',
          capital: 'Paris',
          region: 'Europe',
          subregion: 'Western Europe',
          population: 67391582,
          area: 551695,
          population_density: 122.15,
          currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
          languages: [{ code: 'fra', name: 'French' }],
        },
      ],
    }),
    getCountryById: jest.fn().mockImplementation((id) => {
      if (id === 1) {
        return Promise.resolve({
          rows: [
            {
              id: 1,
              name: 'Germany',
              official_name: 'Federal Republic of Germany',
              capital: 'Berlin',
              region: 'Europe',
            },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    }),
  },
}));

jest.mock('../utils/logging/consoleLogger', () => ({
  ConsoleLogger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock('../utils/Pagination/pagination', () => ({
  Pagination: {
    calculatePagination: jest.fn().mockImplementation((page, limit, totalCount) => {
      return {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        offset: (page - 1) * limit,
        hasNextPage: page * limit < totalCount,
        hasPreviousPage: page > 1
      };
    }),
  },
}));

describe('CountryService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should retrieve countries with pagination', async () => {
    // Act
    const result = await CountryService.getAllCountries(undefined, 1, 10);

    // Assert
    expect(CountryRepository.getTotalCount).toHaveBeenCalledWith(undefined);
    expect(CountryRepository.getAllCountries).toHaveBeenCalled();
    expect(result.data).toHaveLength(2);
    expect(result.meta).toHaveProperty('page', 1);
    expect(result.meta).toHaveProperty('limit', 10);
    expect(result.meta).toHaveProperty('totalPages');
    expect(result.meta).toHaveProperty('offset');
    expect(result.meta).toHaveProperty('hasNextPage');
    expect(result.meta).toHaveProperty('hasPreviousPage');
  });

  it('should filter countries by criteria', async () => {
    // Act
    const result = await CountryService.getAllCountries('Europe', 1, 10);

    // Assert
    expect(CountryRepository.getTotalCount).toHaveBeenCalledWith('Europe');
    expect(CountryRepository.getAllCountries).toHaveBeenCalledWith('Europe', 10, 0);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].region).toBe('Europe');
  });

  it('should retrieve a country by ID', async () => {
    // Act
    const result = await CountryService.getCountryById(1);

    // Assert
    expect(CountryRepository.getCountryById).toHaveBeenCalledWith(1);
    expect(result).toHaveProperty('id', 1);
    expect(result).toHaveProperty('name', 'Germany');
  });

  it('should throw an error for invalid ID', async () => {
    // Act & Assert
    await expect(CountryService.getCountryById(NaN)).rejects.toThrow('Invalid ID parameter');
  });

  it('should throw an error when country not found', async () => {
    // Act & Assert
    await expect(CountryService.getCountryById(999)).rejects.toThrow('Country with ID 999 not found');
  });
});