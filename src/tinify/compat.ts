import * as fs from "fs"

/** @internal */
function promisify(fn: Function): Function {
  return function() {
    const args = Array.from(arguments)

    return new Promise((resolve, reject) => {
      args.push((err: Error, value: any) => {
        if (err) return reject(err)
        resolve(value)
      })

      fn.apply(undefined, args)
    })
  }
}

/** @internal */
type ReadCallback = (path: string) => Promise<Buffer>

/** @internal */
export const readFile = promisify(fs.readFile) as ReadCallback

/** @internal */
type WriteCallback = (path: string, data: Buffer) => Promise<void>

/** @internal */
export const writeFile = promisify(fs.writeFile) as WriteCallback

/** @internal */
import nodeify = require("promise-nodeify")

/** @internal */
export {nodeify}

export type Callback<T = void> = (err: Error | null, data?: T) => void
