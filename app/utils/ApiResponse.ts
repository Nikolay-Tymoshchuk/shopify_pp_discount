export class ApiResponse {
  static json<T>(status: number, error: string | null, data: T): Response {
    return Response.json({
      status,
      error,
      data,
    });
  }

  static error<T>(status: number, message: string, data: T) {
    return this.json(status, message, data);
  }

  static success<T>(data: T) {
    return this.json(200, null, data);
  }

  static notFound<T>(message: string, data: T) {
    return this.json(404, message, data);
  }
}
