import {nodeify, Callback} from "./tinify/compat"

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

class Tinify {
  default = this

  compressionCount?: number

  Client!: typeof Client
  Source!: typeof Source
  Result!: typeof Result
  ResultMeta!: typeof ResultMeta

  Error!: typeof Error
  AccountError!: typeof AccountError
  ClientError!: typeof ClientError
  ServerError!: typeof ServerError
  ConnectionError!: typeof ConnectionError

  set key(key: string) {
    this._key = key
    this._client = undefined
  }

  set appIdentifier(appIdentifier: string) {
    this._appIdentifier = appIdentifier
    this._client = undefined
  }

  set proxy(proxy: string) {
    this._proxy = proxy
    this._client = undefined
  }

  get client(): Client {
    if (!this._key) {
      throw new this.AccountError("Provide an API key with tinify.key = ...")
    }

    if (!this._client) {
      this._client = new this.Client(this._key, this._appIdentifier, this._proxy)
    }

    return this._client
  }

  fromFile(path: string): Source {
    return Source.fromFile(path)
  }

  fromBuffer(data: string | Uint8Array): Source {
    return Source.fromBuffer(data)
  }

  fromUrl(url: string): Source {
    return Source.fromUrl(url)
  }

  validate(): Promise<void>
  validate(callback: Callback): void
  validate(callback?: Callback): Promise<void> | void {
    function is429(err: Error) {
      return err instanceof AccountError && err.status === 429
    }

    try {
      const request = this.client.request("post", "/shrink")

      return nodeify(request.catch(err => {
        if (err instanceof ClientError || is429(err)) return
        throw err
      }).then(function ignore() {}), callback)
    } catch(err) {
      return nodeify(Promise.reject(err), callback)
    }
  }

  /** @internal */
  private _client?: Client

  /** @internal */
  private _key?: string

  /** @internal */
  private _appIdentifier?: string

  /** @internal */
  private _proxy?: string
}

export default new Tinify
