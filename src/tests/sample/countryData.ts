import { CountryTransformer } from '../../etl/transformer';
import { RawCountryData } from '../../types/country'; // Import the type

// Define the mock data with the correct type
export const mockRawCountries: RawCountryData[] = [
  {
    name: {
      common: 'Germany',
      official: 'Federal Republic of Germany',
    },
    capital: ['Berlin'],
    region: 'Europe',
    subregion: 'Western Europe',
    population: 83240525,
    area: 357114,
    currencies: {
      EUR: {
        name: 'Euro',
        symbol: '€',
      },
    },
    languages: {
      deu: 'German',
    },
  },
  {
    name: {
      common: 'France',
      official: 'French Republic',
    },
    capital: ['Paris'],
    region: 'Europe',
    subregion: 'Western Europe',
    population: 67391582,
    area: 551695,
    currencies: {
      EUR: {
        name: 'Euro',
        symbol: '€',
      },
    },
    languages: {
      fra: 'French',
    },
  },
];

describe('ETL Pipeline', () => {
  describe('Transformer', () => {
    it('should transform raw country data correctly', () => {
      // Arrange
      const transformer = new CountryTransformer();
      
      // Act
      const result = transformer.transform(mockRawCountries);
      
      // Assert
      expect(result).toHaveLength(mockRawCountries.length);
      expect(result[0]).toHaveProperty('name', 'Germany');
      expect(result[0]).toHaveProperty('officialName', 'Federal Republic of Germany');
      expect(result[0]).toHaveProperty('capital', 'Berlin');
      expect(result[0].currencies).toHaveLength(1);
      expect(result[0].currencies[0]).toHaveProperty('code', 'EUR');
    });
  });
});