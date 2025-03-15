import { RawCountryData, TransformedCountry, Currency, Language } from '../types/country';
import { ConsoleLogger } from '../utils/logging/consoleLogger';

export class CountryTransformer {
  private logger: ConsoleLogger;

  constructor() {
    this.logger = new ConsoleLogger();
  }

  transform(rawCountries: RawCountryData[]): TransformedCountry[] {
    this.logger.log(`Transforming ${rawCountries.length} countries`);

    return rawCountries.map(country => {
      // Extract and flatten nested structures
      const transformedCountry: TransformedCountry = {
        name: country.name.common,
        officialName: country.name.official,
        capital: Array.isArray(country.capital) ? country.capital[0] : null,
        region: country.region,
        subregion: country.subregion || null,
        population: country.population,
        area: country.area || null,

        // Computed fields
        populationDensity: this.calculatePopulationDensity(country.population, country.area),

        // Normalized fields to be stored in related tables
        currencies: this.extractCurrencies(country.currencies),
        languages: this.extractLanguages(country.languages),

        // Original data for reference (optional)
        rawData: JSON.stringify(country),
      };

      return transformedCountry;
    });
  }

  private calculatePopulationDensity(population: number, area: number | null): number | null {
    if (!area || area === 0) return null;
    return parseFloat((population / area).toFixed(2));
  }

  private extractCurrencies(currenciesObj: Record<string, any> | undefined): Currency[] {
    if (!currenciesObj) return [];

    return Object.entries(currenciesObj).map(([code, details]) => ({
      code,
      name: details.name,
      symbol: details.symbol || null,
    }));
  }

  private extractLanguages(languagesObj: Record<string, string> | undefined): Language[] {
    if (!languagesObj) return [];

    return Object.entries(languagesObj).map(([code, name]) => ({
      code,
      name,
    }));
  }
}
