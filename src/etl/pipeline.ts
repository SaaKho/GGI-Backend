import { CountryExtractor } from './extractor';
import { CountryTransformer } from './transformer';
import { CountryLoader } from './loader';
import { ConsoleLogger } from '../utils/logging/consoleLogger';

export class ETLPipeline {
  private extractor: CountryExtractor;
  private transformer: CountryTransformer;
  private loader: CountryLoader;
  private logger: ConsoleLogger;

  constructor() {
    this.extractor = new CountryExtractor();
    this.transformer = new CountryTransformer();
    this.loader = new CountryLoader();
    this.logger = new ConsoleLogger();
  }

  async run(): Promise<void> {
    try {
      this.logger.log('Starting ETL pipeline...');

      // Extract data
      const rawData = await this.extractor.extract();

      // Transform data
      const transformedData = this.transformer.transform(rawData);

      // Load data
      await this.loader.load(transformedData);

      this.logger.log('ETL pipeline completed successfully');
    } catch (error) {
      this.logger.error(`ETL pipeline failed: ${error}`);
      throw error;
    }
  }
}
