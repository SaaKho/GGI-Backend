import axios from 'axios';
import { config } from '../config';
import { RawCountryData } from '../types/country';

export class CountryExtractor {
  private apiUrl: string;

  constructor() {
    this.apiUrl = config.countriesApiUrl || 'https://restcountries.com/v3.1/all';
  }

  async extract(): Promise<RawCountryData[]> {
    try {
      console.log(`Extracting data from ${this.apiUrl}`);
      const response = await axios.get<RawCountryData[]>(this.apiUrl);
      console.log(`Successfully extracted ${response.data.length} countries`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`API extraction error: ${error.message}`);
        if (error.response) {
          console.error(`Status: ${error.response.status}, Data:`, error.response.data);
        }
      } else {
        console.error('Unknown extraction error:', error);
      }
      throw new Error('Failed to extract countries data');
    }
  }
}
