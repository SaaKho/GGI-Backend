import { ETLPipeline } from '../etl/pipeline';
import { CountryExtractor } from '../etl/extractor';
import { CountryTransformer } from '../etl/transformer';
import { CountryLoader } from '../etl/loader';
import { ConsoleLogger } from '../utils/logging/consoleLogger';
import { mockRawCountries } from './sample/countryData';

// Mock dependencies
jest.mock('../etl/extractor');
jest.mock('../etl/transformer');
jest.mock('../etl/loader');
jest.mock('../utils/logging/consoleLogger', () => ({
  ConsoleLogger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
  })),
}));

describe('ETLPipeline', () => {
  let pipeline: ETLPipeline;
  let mockExtractor: jest.Mocked<CountryExtractor>;
  let mockTransformer: jest.Mocked<CountryTransformer>;
  let mockLoader: jest.Mocked<CountryLoader>;
  
  const transformedData = [
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
      rawData: '{}'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mocks
    mockExtractor = new CountryExtractor() as jest.Mocked<CountryExtractor>;
    mockTransformer = new CountryTransformer() as jest.Mocked<CountryTransformer>;
    mockLoader = new CountryLoader() as jest.Mocked<CountryLoader>;
    
    // Configure mock implementations
    (CountryExtractor as jest.MockedClass<typeof CountryExtractor>)
      .mockImplementation(() => mockExtractor);
    (CountryTransformer as jest.MockedClass<typeof CountryTransformer>)
      .mockImplementation(() => mockTransformer);
    (CountryLoader as jest.MockedClass<typeof CountryLoader>)
      .mockImplementation(() => mockLoader);
    
    mockExtractor.extract = jest.fn().mockResolvedValue(mockRawCountries);
    mockTransformer.transform = jest.fn().mockReturnValue(transformedData);
    mockLoader.load = jest.fn().mockResolvedValue(undefined);
    
    pipeline = new ETLPipeline();
  });

  it('should execute the full ETL pipeline successfully', async () => {
    // Act
    await pipeline.run();

    // Assert
    expect(mockExtractor.extract).toHaveBeenCalledTimes(1);
    expect(mockTransformer.transform).toHaveBeenCalledTimes(1);
    expect(mockTransformer.transform).toHaveBeenCalledWith(mockRawCountries);
    expect(mockLoader.load).toHaveBeenCalledTimes(1);
    expect(mockLoader.load).toHaveBeenCalledWith(transformedData);
  });

  it('should handle extraction errors', async () => {
    // Arrange
    const errorMessage = 'Extraction error';
    mockExtractor.extract.mockRejectedValueOnce(new Error(errorMessage));

    // Act & Assert
    await expect(pipeline.run()).rejects.toThrow(errorMessage);
    expect(mockTransformer.transform).not.toHaveBeenCalled();
    expect(mockLoader.load).not.toHaveBeenCalled();
  });

  it('should handle transformation errors', async () => {
    // Arrange
    const errorMessage = 'Transformation error';
    mockTransformer.transform.mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    // Act & Assert
    await expect(pipeline.run()).rejects.toThrow(errorMessage);
    expect(mockExtractor.extract).toHaveBeenCalled();
    expect(mockLoader.load).not.toHaveBeenCalled();
  });

  it('should handle loading errors', async () => {
    // Arrange
    const errorMessage = 'Loading error';
    mockLoader.load.mockRejectedValueOnce(new Error(errorMessage));

    // Act & Assert
    await expect(pipeline.run()).rejects.toThrow(errorMessage);
    expect(mockExtractor.extract).toHaveBeenCalled();
    expect(mockTransformer.transform).toHaveBeenCalled();
  });
});