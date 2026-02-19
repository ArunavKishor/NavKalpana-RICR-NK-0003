export const parsePagination = (query = {}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 20;

  if (!Number.isInteger(page) || page <= 0) {
    return { error: "Page must be a positive integer" };
  }

  if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
    return { error: "Limit must be a positive integer not exceeding 100" };
  }

  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
  };
};
