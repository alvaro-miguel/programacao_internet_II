
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, details?: any) {
    super(400, message, details);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = "Recurso não encontrado.") {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message: string) {
    super(422, message);
  }
}

export class PayloadTooLargeError extends HttpError {
  constructor(message: string = "Arquivo muito grande.") {
    super(413, message);
  }
}
