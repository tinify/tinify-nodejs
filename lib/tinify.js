"use strict"

var tinify = module.exports = {
  set key(key) {
    this._key = key
    this._client = null
  },

  set appIdentifier(appIdentifier) {
    this._appIdentifier = appIdentifier
    this._client = null
  },

  get client() {
    if (!this._key) {
      throw new tinify.AccountError("Provide an API key with tinify.key = ...")
    }

    if (!this._client) {
      this._client = new tinify.Client(this._key, this._appIdentifier)
    }

    return this._client
  },

  fromFile: function(path) {
    return tinify.Source.fromFile(path)
  },

  fromBuffer: function(string) {
    return tinify.Source.fromBuffer(string)
  },

  fromUrl: function(url) {
    return tinify.Source.fromUrl(url)
  },

  validate: function(callback) {
    try {
      var request = this.client.request("post", "/shrink")
      return request.catch(tinify.ClientError, function() { return null }).nodeify(callback)
    } catch(err) {
      return tinify.Promise.reject(err).nodeify(callback)
    }
  }
}

var errors = require("./tinify/Error")
for (var name in errors) tinify[name] = errors[name]

tinify.Promise = require("bluebird")
tinify.fs = tinify.Promise.promisifyAll(require("fs"))

tinify.Client = require("./tinify/Client")
tinify.ResultMeta = require("./tinify/ResultMeta")
tinify.Result = require("./tinify/Result")
tinify.Source = require("./tinify/Source")
