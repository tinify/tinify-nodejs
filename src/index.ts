import tinify from "./tinify"

import Client from "./tinify/Client"
import Result from "./tinify/Result"
import ResultMeta from "./tinify/ResultMeta"
import Source from "./tinify/Source"

import {
  Error,
  AccountError,
  ClientError,
  ServerError,
  ConnectionError,
} from "./tinify/Error"

tinify.Client = Client
tinify.ResultMeta = ResultMeta
tinify.Result = Result
tinify.Source = Source

tinify.Error = Error
tinify.AccountError = AccountError
tinify.ClientError = ClientError
tinify.ServerError = ServerError
tinify.ConnectionError = ConnectionError

export = tinify
