export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field?: string; message: string }>;
}

export interface UserData {
  id: number;
  username: string;
  createdAt: string;
}

export interface RegisterParams {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserData;
}

export interface FactData {
  id: number;
  fact: string;
  length: number;
  liked: boolean;
  likesCount: number;
}

export interface FactLikeResponse {
  liked: boolean;
  likesCount: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedFactsResponse {
  facts: FactData[];
}

export interface ListFactsParams {
  page?: number;
  limit?: number;
}
