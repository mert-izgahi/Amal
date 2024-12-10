export class ApiError extends Error {
  status: number;
  name: string;
  constructor(status: number, name: string, message: string) {
    super(message);
    this.status = status;
    this.name = name;
  }
  
  static badRequest(message: string) {
    return new ApiError(400, "BAD_REQUEST", message);
  }

  static internal(message: string) {
    return new ApiError(500, "INTERNAL_SERVER_ERROR", message);
  }

  static notFound(message: string) {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static unauthorized(message: string) {
    return new ApiError(403, "UNAUTHORIZED", message);
  }

  static unauthenticated(message: string) {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message: string) {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static conflict(message: string) {
    return new ApiError(409, "CONFLICT", message);
  }

  static notImplemented(message: string) {
    return new ApiError(501, "NOT_IMPLEMENTED", message);
  }
}
