import request from 'supertest';
import express from 'express';
import { CountryController } from '../api/controllers';
import { CountryService } from '../services/countryService';
import { ConsoleLogger } from '../utils/logging/consoleLogger';

// Mock dependencies
jest.mock('../services/countryService', () => ({
  CountryService: {
    getAllCountries: jest.fn().mockImplementation((filter, page, limit) => {
      return Promise.resolve({
        data: [
          {
            id: 1,
            name: 'Germany',
            officialName: 'Federal Republic of Germany',
            capital: 'Berlin',
            region: 'Europe',
            subregion: 'Western Europe',
            population: 83240525,
            area: 357114,
            populationDensity: 233.09,
            currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
            languages: [{ code: 'deu', name: 'German' }]
          }
        ],
        meta: {
          page: page || 1,
          limit: limit || 10,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      });
    }),
    getCountryById: jest.fn().mockImplementation((id) => {
      if (id === 1) {
        return Promise.resolve({
          id: 1,
          name: 'Germany',
          officialName: 'Federal Republic of Germany',
          capital: 'Berlin',
          region: 'Europe'
        });
      }
      throw new Error(`Country with ID ${id} not found`);
    })
  }
}));

jest.mock('../utils/logging/consoleLogger', () => ({
  ConsoleLogger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn()
  }))
}));

// Create an express app for testing
const app = express();
app.use(express.json());
app.get('/api/data', CountryController.getAllCountries);
app.get('/api/data/:id', CountryController.getCountryById);

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should return countries with pagination', async () => {
    const response = await request(app)
      .get('/api/data')
      .query({ page: '1', limit: '10' });
    
    expect(response.status).toBe(200);
    expect(CountryService.getAllCountries).toHaveBeenCalledWith(undefined, 1, 10);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe('Germany');
  });
  
  it('should filter countries by query parameter', async () => {
    const response = await request(app)
      .get('/api/data')
      .query({ filter: 'Europe', page: '1', limit: '10' });
    
    expect(response.status).toBe(200);
    expect(CountryService.getAllCountries).toHaveBeenCalledWith('Europe', 1, 10);
  });
  
  it('should return a country by ID', async () => {
    const response = await request(app).get('/api/data/1');
    
    expect(response.status).toBe(200);
    expect(CountryService.getCountryById).toHaveBeenCalledWith(1);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('name', 'Germany');
  });
  
  it('should handle errors for non-existent country', async () => {
    const response = await request(app).get('/api/data/999');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });
  
  it('should handle invalid ID parameter', async () => {
    const response = await request(app).get('/api/data/invalid');
    
    expect(response.status).toBe(500);
  });
});