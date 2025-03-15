import { ConsoleLogger } from '../utils/logging/consoleLogger';
import { Pagination } from '../utils/Pagination/pagination';
import { CountryRepository } from '../repositories/countryRepository';

const logger = new ConsoleLogger();

export class CountryService {
  static async getAllCountries(filter?: string, page: number = 1, limit: number = 10) {
    logger.log(
      `Fetching countries with filter: ${filter || 'none'}, page: ${page}, limit: ${limit}`
    );

    const totalCount = await CountryRepository.getTotalCount(filter);
    const pagination = Pagination.calculatePagination(page, limit, totalCount);

    const result = await CountryRepository.getAllCountries(
      filter,
      pagination.limit,
      pagination.offset
    );
    logger.log(`Fetched ${result.rows.length} countries from the database`);

    return {
      data: result.rows,
      meta: pagination,
    };
  }

  static async getCountryById(id: number) {
    if (isNaN(id)) {
      throw new Error('Invalid ID parameter');
    }

    logger.log(`Fetching country with ID: ${id}`);

    const result = await CountryRepository.getCountryById(id);

    if (result.rows.length === 0) {
      throw new Error(`Country with ID ${id} not found`);
    }

    return result.rows[0];
  }
}
