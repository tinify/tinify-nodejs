import {IncomingHttpHeaders} from "http"
import {nodeify, Callback} from "./compat"

const intify = (v?: string): number => parseInt(v!, 10)

export default class ResultMeta {
  /** @internal */
  protected _meta: Promise<IncomingHttpHeaders>

  /** @internal */
  constructor(meta: Promise<IncomingHttpHeaders>) {
    this._meta = meta
  }

  /** @internal */
  meta() {
    return this._meta
  }

  width(): Promise<number>
  width(callback: Callback<number>): void
  width(callback?: Callback<number>): Promise<number> | void {
    return nodeify(this.meta().then(meta => intify(meta["image-width"] as string)), callback)
  }

  height(): Promise<number>
  height(callback: Callback<number>): void
  height(callback?: Callback<number>): Promise<number> | void {
    return nodeify(this.meta().then(meta => intify(meta["image-height"] as string)), callback)
  }

  location(): Promise<string | void>
  location(callback: Callback<string>): void
  location(callback?: Callback<string>): Promise<string | void> | void {
    return nodeify(this.meta().then(meta => meta["location"] as string), callback)
  }
}
