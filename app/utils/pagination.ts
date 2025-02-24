export interface PaginationParams {
  page: number;
  limit: number;
}

export const getPaginationParams = (
  url: URL,
  defaultLimit = 5,
): PaginationParams => ({
  page: Number(url.searchParams.get("page")) || 1,
  limit: Number(url.searchParams.get("limit")) || defaultLimit,
});
