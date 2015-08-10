"use strict"

var tinify = require("../tinify")
var extend = require("util")._extend

function Source(url, commands) {
  this._url = url
  this._commands = commands || {}
}

Source.fromFile = function(path) {
  var url = tinify.fs.readFileAsync(path).then(function(string) {
    return tinify.client.request("post", "/shrink", string).get("headers").get("location")
  })

  return new tinify.Source(url)
}

Source.fromBuffer = function(string) {
  var url = tinify.client.request("post", "/shrink", string).get("headers").get("location")
  return new tinify.Source(url)
}

Source.prototype.resize = function(options) {
  return new tinify.Source(this._url, extend({resize: options}, this._commands))
}

Source.prototype.store = function(options) {
  var commands = extend({store: options}, this._commands)
  var response = this._url.then(function(url) {
    return tinify.client.request("post", url, commands)
  })

  return new tinify.ResultMeta(response.get("headers"))
}

Source.prototype.result = function() {
  var commands = this._commands
  var response = this._url.then(function(url) {
    return tinify.client.request("get", url, commands)
  })

  return new tinify.Result(response.get("headers"), response.get("body"))
}

Source.prototype.toFile = function(path, callback) {
  return this.result().toFile(path, callback)
}

Source.prototype.toBuffer = function(callback) {
  return this.result().toBuffer(callback)
}

module.exports = Source
