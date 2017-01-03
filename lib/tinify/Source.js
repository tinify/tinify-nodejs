"use strict"

var tinify = require("../tinify")

var readFile = require("./compat").readFile
var assign = require("./compat").assign

function Source(url, commands) {
  this._url = url
  this._commands = commands || {}
}

Source.fromFile = function(path) {
  var location = readFile(path).then(function(string) {
    var response = tinify.client.request("post", "/shrink", string)
    return response.then(function(res) { return res.headers.location })
  })

  return new tinify.Source(location)
}

Source.fromBuffer = function(string) {
  var response = tinify.client.request("post", "/shrink", string)
  var location = response.then(function(res) { return res.headers.location })
  return new tinify.Source(location)
}

Source.fromUrl = function(url) {
  var response = tinify.client.request("post", "/shrink", {source: {url: url}})
  var location = response.then(function(res) { return res.headers.location })
  return new tinify.Source(location)
}

Source.prototype.preserve = function() {
  var options = Array.prototype.concat.apply([], arguments)
  return new tinify.Source(this._url, assign({preserve: options}, this._commands))
}

Source.prototype.resize = function(options) {
  return new tinify.Source(this._url, assign({resize: options}, this._commands))
}

Source.prototype.store = function(options) {
  var commands = assign({store: options}, this._commands)
  var response = this._url.then(function(url) {
    return tinify.client.request("post", url, commands)
  })

  return new tinify.ResultMeta(
    response.then(function(res) { return res.headers })
  )
}

Source.prototype.result = function() {
  var commands = this._commands
  var response = this._url.then(function(url) {
    return tinify.client.request("get", url, commands)
  })

  return new tinify.Result(
    response.then(function(res) { return res.headers }),
    response.then(function(res) { return res.body })
  )
}

Source.prototype.toFile = function(path, callback) {
  return this.result().toFile(path, callback)
}

Source.prototype.toBuffer = function(callback) {
  return this.result().toBuffer(callback)
}

module.exports = Source
