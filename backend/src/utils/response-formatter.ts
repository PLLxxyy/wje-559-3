export interface ApiResult<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export function ok<T>(data: T): ApiResult<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}
