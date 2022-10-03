import tinify from "../tinify"
import {readFile, Callback} from "./compat"

import Client from "./Client"
import Result from "./Result"
import ResultMeta from "./ResultMeta"

export default class Source {
  /** @internal */
  private _url: Promise<string>

  /** @internal */
  private _commands: object

  /** @internal */
  constructor(url: Promise<string>, commands?: object) {
    this._url = url
    this._commands = commands || {}
  }

  static fromFile(path: string): Source {
    const location = readFile(path).then(data => {
      const response = (tinify.client as Client).request("post", "/shrink", data)
      return response.then(res => res.headers.location!)
    })

    return new tinify.Source(location)
  }

  static fromBuffer(data: string | Uint8Array): Source {
    const response = (tinify.client as Client).request("post", "/shrink", data)
    const location = response.then(res => res.headers.location!)
    return new tinify.Source(location)
  }

  static fromUrl(url: string): Source {
    const response = (tinify.client as Client).request("post", "/shrink", {source: {url}})
    const location = response.then(res => res.headers.location!)
    return new tinify.Source(location)
  }

  preserve(options: string[]): Source
  preserve(...options: string[]): Source
  preserve(...options: any[]): Source {
    if (Array.isArray(options[0])) options = options[0]
    return new tinify.Source(this._url, Object.assign({preserve: options}, this._commands))
  }

  resize(options: object): Source {
    return new tinify.Source(this._url, Object.assign({resize: options}, this._commands))
  }

  store(options: object): ResultMeta {
    const commands = Object.assign({store: options}, this._commands)
    const response = this._url.then(url => {
      return tinify.client.request("post", url, commands)
    })

    return new tinify.ResultMeta(
      response.then(res => res.headers)
    )
  }

  result(): Result {
    const commands = this._commands
    const response = this._url.then(url => {
      return tinify.client.request("get", url, commands)
    })

    return new tinify.Result(
      response.then(res => res.headers),
      response.then(res => res.body)
    )
  }

  toFile(path: string): Promise<void>
  toFile(path: string, callback: Callback): void
  toFile(path: string, callback?: Callback): Promise<void> | void {
    return this.result().toFile(path, callback!)
  }

  toBuffer(): Promise<Uint8Array>
  toBuffer(callback: Callback<Uint8Array>): void
  toBuffer(callback?: Callback<Uint8Array>): Promise<Uint8Array> | void {
    return this.result().toBuffer(callback!)
  }

  convert(options: object): Source {
      return new tinify.Source(
        this._url,
        Object.assign({ convert: options }, this._commands)
      )
  }

  transform(options: object): Source {
      return new tinify.Source(
        this._url,
        Object.assign({ transform: options }, this._commands)
       );
  }
}
