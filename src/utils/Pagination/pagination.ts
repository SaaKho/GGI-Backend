export class Pagination {
  /**
   * Calculates offset and validates page & limit values.
   */
  static calculatePagination(page: number, limit: number, totalCount: number) {
    if (isNaN(page) || page < 1) {
      page = 1;
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      limit = 10;
    }

    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      page,
      limit,
      offset,
      totalPages,
      hasNextPage: page * limit < totalCount,
      hasPreviousPage: page > 1,
    };
  }
}
