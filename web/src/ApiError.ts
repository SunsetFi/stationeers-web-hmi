export class ApiError extends Error {
  statusCode: number;
  statusMessage: string;

  constructor(statusCode: number, statusMessage: string) {
    super(`${statusCode}: ${statusMessage}`);
    this.message = `${statusCode}: ${statusMessage}`;
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
