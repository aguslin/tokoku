export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp?: string;
}

export interface ApiError extends Error {
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

class ApiErrorImpl extends Error implements ApiError {
  code?: string;
  status?: number;
  details?: Record<string, any>;

  constructor(message: string, code?: string, status?: number, details?: Record<string, any>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const createApiError = (
  message: string,
  code: string = 'UNKNOWN_ERROR',
  status: number = 500,
  details?: Record<string, any>
): ApiError => {
  return new ApiErrorImpl(message, code, status, details);
};

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiErrorImpl) {
    return error;
  }

  if (error instanceof Error) {
    return createApiError(error.message, 'REQUEST_FAILED');
  }

  return createApiError('An unexpected error occurred', 'UNKNOWN_ERROR');
};
