import {IncomingHttpHeaders} from "http"
import {nodeify, writeFile, Callback} from "./compat"
import ResultMeta from "./ResultMeta"

const ignore = () => {}
const intify = (v?: string): number => parseInt(v!, 10)

export default class Result extends ResultMeta {
  /** @internal */
  protected _data: Promise<Uint8Array>

  /** @internal */
  constructor(meta: Promise<IncomingHttpHeaders>, data: Promise<Uint8Array>) {
    super(meta)
    this._data = data
  }

  /** @internal */
  meta(): Promise<IncomingHttpHeaders> {
    /* Ignore errors on data, because they'll be propagated to meta too. */
    return this._data.catch(ignore) && this._meta
  }

  /** @internal */
  data(): Promise<Uint8Array> {
    /* Ignore errors on meta, because they'll be propagated to data too. */
    return this._meta.catch(ignore) && this._data
  }

  toFile(path: string): Promise<void>
  toFile(path: string, callback: Callback): void
  toFile(path: string, callback?: Callback): Promise<void> | void {
    const writer = writeFile.bind(null, path) as (data: Uint8Array) => Promise<void>
    return nodeify(this.data().then(writer), callback)
  }

  toBuffer(): Promise<Uint8Array>
  toBuffer(callback: Callback<Uint8Array>): void
  toBuffer(callback?: Callback<Uint8Array>): Promise<Uint8Array> | void {
    return nodeify(this.data(), callback)
  }

  size(): Promise<number>
  size(callback: Callback<number>): void
  size(callback?: Callback<number>): Promise<number> | void {
    return nodeify(this.meta().then(meta => intify(meta["content-length"] as string)), callback)
  }

  mediaType(): Promise<string | void>
  mediaType(callback: Callback<string>): void
  mediaType(callback?: Callback<string>): Promise<string | void> | void {
    return nodeify(this.meta().then(meta => meta["content-type"] as string), callback)
  }

  contentType(): Promise<string | void>
  contentType(callback: Callback<string>): void
  contentType(callback?: Callback<string>): Promise<string | void> | void {
    return this.mediaType(callback!)
  }

  extension(): Promise<string | void>
  extension(callback: Callback<string>): void
  extension(callback?: Callback<string>): Promise<string | void> | void {
    return nodeify(this.meta().then(meta => (meta["content-type"] || " ").split("/")[1]), callback)
  }
}
