"use strict"

var https = require("https")
var url = require("url")
var engine = require("detect-engine")

var version = require("../../package.json").version
var tinify = require("../tinify")

function Client(key, appIdentifier) {
  this.userAgent = [this.USER_AGENT, appIdentifier].filter(Boolean).join(" ")
  this.defaultOptions = {
    caBundle: this.CA_BUNDLE,
    rejectUnauthorized: true,
    auth: "api:" + key,
  }
}

Client.prototype.API_ENDPOINT = "https://api.tinify.com"

Client.prototype.USER_AGENT = "Tinify/" + version + " Node/" + process.versions.node + " (" + engine + ")"

Client.prototype.CA_BUNDLE = function() {
  var boundaries = /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----\n/g
  var data = tinify.fs.readFileSync(__dirname + "/../data/cacert.pem").toString()
  return data.match(boundaries)
}()

Client.prototype.request = function request(method, path, body, headers) {
  var options = url.parse(url.resolve(this.API_ENDPOINT, path))
  options.method = method
  options.headers = headers || {}
  options.ca = this.CA_BUNDLE

  for (var option in this.defaultOptions) {
    options[option] = this.defaultOptions[option]
  }

  options.headers["User-Agent"] = this.userAgent

  if (body && typeof body === "object") {
    body = JSON.stringify(body)
    options.headers["Content-Type"] = "application/json"
  }

  return new tinify.Promise(function(resolve, reject) {
    var request = https.request(options, function(response) {
      var count = response.headers["compression-count"]
      if (count) tinify.compressionCount = parseInt(count, 10)

      var body = ""
      response.on("data", function(chunk) {
        body += chunk
      })

      response.on("end", function() {
        if (response.statusCode >= 200 && response.statusCode <= 299) {
          resolve({headers: response.headers, body: body})
        } else {
          var details
          try {
            details = JSON.parse(body)
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

    request.on("error", function(err) {
      reject(new tinify.ConnectionError("Error while connecting: " + err.message))
    })

    request.end(body)
  })
}

module.exports = Client
