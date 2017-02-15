"use strict"

const https = require("https")
const url = require("url")
const fs = require("fs")
const proxyAgent = require("proxying-agent")

const version = require("../../package.json").version
const tinify = require("../tinify")

class Client {
  constructor(key, appIdentifier, proxy) {
    this.userAgent = [this.USER_AGENT, appIdentifier].filter(Boolean).join(" ")

    this.defaultOptions = {
      caBundle: this.CA_BUNDLE,
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
        proxy: proxy,
        keepAlive: true,
      }, this.API_ENDPOINT)
    }
  }

  request(method, path, body, headers) {
    let options = url.parse(url.resolve(this.API_ENDPOINT, path))
    options.method = method
    options.headers = headers || {}
    options.ca = this.CA_BUNDLE
    Object.assign(options, this.defaultOptions)

    options.headers["User-Agent"] = this.userAgent

    if (typeof body === "object" && !Buffer.isBuffer(body)) {
      if (Object.keys(body).length) {
        /* Encode as JSON. */
        body = JSON.stringify(body)
        options.headers["Content-Type"] = "application/json"
        options.headers["Content-Length"] = body.length
      } else {
        /* No options, send without body. */
        body = undefined
      }
    }

    return new Promise((resolve, reject) => {
      let request = https.request(options, response => {
        let count = response.headers["compression-count"]
        if (count) tinify.compressionCount = parseInt(count, 10)

        let data = []
        response.on("data", chunk => {
          data.push(chunk)
        })

        response.on("end", () => {
          data = Buffer.concat(data)
          if (response.statusCode >= 200 && response.statusCode <= 299) {
            resolve({headers: response.headers, body: data})
          } else {
            let details
            try {
              details = JSON.parse(data)
            } catch(err) {
              details = {
                message: "Error while parsing response: " + err.message,
                error: "ParseError",
              }
            }
            reject(tinify.Error.create(details.message, details.error, response.statusCode))
          }
        })
      })

      request.on("error", err => {
        reject(new tinify.ConnectionError("Error while connecting: " + err.message))
      })

      request.end(body)
    })
  }
}

Client.prototype.API_ENDPOINT = "https://api.tinify.com"

Client.prototype.USER_AGENT = "Tinify/" + version + " Node/" + process.versions.node + " (" + process.platform + ")"

let boundaries = /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----\n/g
let data = fs.readFileSync(__dirname + "/../data/cacert.pem").toString()
Client.prototype.CA_BUNDLE = data.match(boundaries)

module.exports = Client
