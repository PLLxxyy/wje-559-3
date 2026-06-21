export interface PageQuery {
  page?: string | number;
  limit?: string | number;
}

export function parsePagination(query: PageQuery) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

export function pageResult<T>(items: T[], total: number, page: number, limit: number) {
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}
