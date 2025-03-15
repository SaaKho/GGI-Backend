import axios from 'axios';
import { config } from '../config';
import { RawCountryData } from '../types/country';
import { ConsoleLogger } from '../utils/logging/consoleLogger';

export class CountryExtractor {
  private apiUrl: string;
  private logger: ConsoleLogger;

  constructor() {
    this.apiUrl = config.countriesApiUrl || 'https://restcountries.com/v3.1/all';
    this.logger = new ConsoleLogger();
  }

  async extract(): Promise<RawCountryData[]> {
    try {
      this.logger.log(`Extracting data from ${this.apiUrl}`);
      const response = await axios.get<RawCountryData[]>(this.apiUrl);
      this.logger.log(`Successfully extracted ${response.data.length} countries`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(`API extraction error: ${error.message}`);
        if (error.response) {
          this.logger.error(
            `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`
          );
        }
      } else {
        this.logger.error('Unknown extraction error:, ${error}');
      }
      throw new Error('Failed to extract countries data');
    }
  }
}
