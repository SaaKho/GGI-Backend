import { CountryTransformer } from '../etl/transformer';
import { mockRawCountries } from './sample/countryData';

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