declare module "proxying-agent" {
  class ProxyingAgent {}

  interface ProxyingOptions {
    proxy: string
    keepAlive: boolean
  }

  export function create(options: ProxyingOptions, endpoint: string): ProxyingAgent
}

declare module "promise-nodeify" {
  type Callback<T> = (err: Error | null, val?: T) => void
  function nodeify<T>(promise: Promise<T>, callback?: Callback<T>): Promise<T> | void
  export = nodeify
}

declare module "*/package.json" {
  const version: string
}
