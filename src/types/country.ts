export interface RawCountryData {
    name: {
      common: string;
      official: string;
    };
    capital?: string[];
    region: string;
    subregion?: string;
    population: number;
    area: number;
    currencies?: Record<string, {
      name: string;
      symbol?: string;
    }>;
    languages?: Record<string, string>;
    // Add other fields from the API as needed
  }
  
  export interface Currency {
    code: string;
    name: string;
    symbol: string | null;
  }
  
  export interface Language {
    code: string;
    name: string;
  }
  
  export interface TransformedCountry {
    name: string;
    officialName: string;
    capital: string | null;
    region: string;
    subregion: string | null;
    population: number;
    area: number | null;
    populationDensity: number | null;
    currencies: Currency[];
    languages: Language[];
    rawData: string; // JSON string of the original data
  }