import {IncomingMessage, IncomingHttpHeaders} from "http"
import * as https from "https"
import * as url from "url"
import * as fs from "fs"
import * as proxyAgent from "proxying-agent"

import {version} from "../../package.json"
import tinify from "../tinify"

const boundaries = /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----\n/g
const data = fs.readFileSync(__dirname + "/../data/cacert.pem").toString()

interface ClientOptions {
  ca: RegExpMatchArray
  rejectUnauthorized: boolean
  auth: string
  agent?: proxyAgent.ProxyingAgent
}

/** @internal */
export interface ClientResponse {
  headers: IncomingHttpHeaders
  body: Buffer
}

export default class Client {
  /** @internal */
  private static API_ENDPOINT = "https://api.tinify.com"

  /** @internal */
  private static RETRY_COUNT = 1

  /** @internal */
  private static RETRY_DELAY = 500

  /** @internal */
  private static USER_AGENT = "Tinify/" + version + " Node/" + process.versions.node + " (" + process.platform + ")"

  /** @internal */
  private static CA_BUNDLE = data.match(boundaries)!

  /** @internal */
  userAgent: string

  /** @internal */
  defaultOptions: ClientOptions

  /** @internal */
  constructor(key: string, appIdentifier?: string, proxy?: string) {
    const klass = (this.constructor as typeof Client)

    this.userAgent = [klass.USER_AGENT, appIdentifier].filter(Boolean).join(" ")

    this.defaultOptions = {
      ca: klass.CA_BUNDLE,
      rejectUnauthorized: true,
      auth: "api:" + key,
    }

    if (proxy) {
      if (!url.parse(proxy).hostname) {
        throw new tinify.ConnectionError("Invalid proxy");
      }

      /* Note: although keepAlive is enabled, the proxy agent reconnects to the
         proxy server each time. This makes proxied requests slow. There
         seems to be no proxy tunneling agent that reuses TLS connections. */
      this.defaultOptions.agent = proxyAgent.create({
        proxy,
        keepAlive: true,
      }, klass.API_ENDPOINT)
    }
  }

  /** @internal */
  request(method: string, path: string, body?: string | Buffer | {}): Promise<ClientResponse> {
    const klass = (this.constructor as typeof Client)
    const options: https.RequestOptions = url.parse(url.resolve(klass.API_ENDPOINT, path))

    options.method = method
    options.headers = {}
    Object.assign(options, this.defaultOptions)

    options.headers["User-Agent"] = this.userAgent

    if (typeof body === "object" && !Buffer.isBuffer(body)) {
      if (Object.keys(body).length) {
        /* Encode as JSON. */
        body = JSON.stringify(body)
        options.headers["Content-Type"] = "application/json"
        options.headers["Content-Length"] = (body as string).length
      } else {
        /* No options, send without body. */
        body = undefined
      }
    }

    let retries = klass.RETRY_COUNT + 1
    return new Promise((resolve, reject) => {
      const exec = () => {
        retries -= 1
        const request = https.request(options, (response: IncomingMessage) => {
          const count = response.headers["compression-count"]
          if (count) {
            tinify.compressionCount = parseInt(count as string, 10)
          }

          const chunks: Buffer[] = []
          response.on("data", (chunk: Buffer) => {
            chunks.push(chunk)
          })

          response.on("end", () => {
            const body = Buffer.concat(chunks)
            if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
              resolve({headers: response.headers, body})
            } else {
              let details
              try {
                details = JSON.parse(body.toString())
              } catch(err) {
                details = {
                  message: "Error while parsing response: " + err.message,
                  error: "ParseError",
                }
              }

              if (retries > 0 && response.statusCode && response.statusCode >= 500) {
                return setTimeout(exec, klass.RETRY_DELAY)
              }

              reject(tinify.Error.create(details.message, details.error, response.statusCode))
            }
          })
        })

        request.on("error", err => {
          if (retries > 0) {
            return setTimeout(exec, klass.RETRY_DELAY)
          }

          reject(new tinify.ConnectionError("Error while connecting: " + err.message))
        })

        request.end(body)
      }

      exec()
    })
  }
}
