"use strict"

function Error(message, type, status) {
  global.Error.captureStackTrace(this, Error)
  if (status) {
    this.status = status
    this.message = message + " (HTTP " + status + "/" + type + ")"
  } else {
    this.message = message
  }
}

Error.prototype = Object.create(global.Error.prototype)
Error.prototype.name = "Error"

function AccountError() {
  Error.apply(this, arguments)
}

AccountError.prototype = Object.create(Error.prototype)
AccountError.prototype.name = "AccountError"

function ClientError() {
  Error.apply(this, arguments)
}

ClientError.prototype = Object.create(Error.prototype)
ClientError.prototype.name = "ClientError"

function ServerError() {
  Error.apply(this, arguments)
}

ServerError.prototype = Object.create(Error.prototype)
ServerError.prototype.name = "ServerError"

function ConnectionError() {
  Error.apply(this, arguments)
}

ConnectionError.prototype = Object.create(Error.prototype)
ConnectionError.prototype.name = "ConnectionError"

Error.create = function(message, type, status) {
  var klass
  if (status == 401 || status == 429) {
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

module.exports = {
  Error: Error,
  AccountError: AccountError,
  ClientError: ClientError,
  ServerError: ServerError,
  ConnectionError: ConnectionError,
}
