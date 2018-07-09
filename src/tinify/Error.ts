export class Error extends global.Error {
  status?: number

  /** @internal */
  constructor(message: string, type?: string, status?: number) {
    super()
    global.Error.captureStackTrace(this, Error)
    if (status) {
      this.status = status
      this.message = message + ` (HTTP ${status}/${type})`
    } else {
      this.message = message
    }
  }

  /** @internal */
  static create(message: string, type: string, status?: number): Error {
    let klass
    if (!status) {
      klass = Error
    } else if (status === 401 || status === 429) {
      klass = AccountError
    } else if (status >= 400 && status <= 499) {
      klass = ClientError
    } else if (status >= 500 && status <= 599) {
      klass = ServerError
    } else {
      klass = Error
    }

    if (!message) {
      message = "No message was provided"
    }

    return new klass(message, type, status)
  }
}

export class AccountError extends Error {}
export class ClientError extends Error {}
export class ServerError extends Error {}
export class ConnectionError extends Error {}
