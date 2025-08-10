// Types de base pour les projets futurs
export interface BaseApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface BasePaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface BaseApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
