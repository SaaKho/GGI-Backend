import { CountryExtractor } from './extractor';
import { CountryTransformer } from './transformer';
import { CountryLoader } from './loader';

export class ETLPipeline {
  private extractor: CountryExtractor;
  private transformer: CountryTransformer;
  private loader: CountryLoader;

  constructor() {
    this.extractor = new CountryExtractor();
    this.transformer = new CountryTransformer();
    this.loader = new CountryLoader();
  }

  async run(): Promise<void> {
    try {
      console.log('Starting ETL pipeline...');

      // Extract data
      const rawData = await this.extractor.extract();

      // Transform data
      const transformedData = this.transformer.transform(rawData);

      // Load data
      await this.loader.load(transformedData);

      console.log('ETL pipeline completed successfully');
    } catch (error) {
      console.error('ETL pipeline failed:', error);
      throw error;
    }
  }
}
