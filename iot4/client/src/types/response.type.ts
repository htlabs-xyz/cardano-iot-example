export type ApiResponse<T> = {
  status: boolean;
  statusCode: number;
  path: string;
  message: string;
  data?: T;
  timestamp: string;
};
