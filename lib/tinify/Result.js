"use strict"

var tinify = require("../tinify")

var nodeify = require("./compat").nodeify
var writeFile = require("./compat").writeFile

function ignore() {}

function intify(v) {
  return parseInt(v, 10)
}

function Result(meta, data) {
  this._meta = meta
  this._data = data
}

Result.prototype = Object.create(tinify.ResultMeta.prototype)

Result.prototype.meta = function() {
  /* Ignore errors on data, because they'll be propagated to meta too. */
  return this._data.catch(ignore) && this._meta
}

Result.prototype.data = function() {
  /* Ignore errors on meta, because they'll be propagated to data too. */
  return this._meta.catch(ignore) && this._data
}

Result.prototype.toFile = function(path, callback) {
  return nodeify(this.data().then(writeFile.bind(null, path)), callback)
}

Result.prototype.toBuffer = function(callback) {
  return nodeify(this.data(), callback)
}

Result.prototype.size = function(callback) {
  return nodeify(this.meta().then(function(meta) { return intify(meta["content-length"]) }), callback)
}

Result.prototype.mediaType = function(callback) {
  return nodeify(this.meta().then(function(meta) { return meta["content-type"] }), callback)
}

Result.prototype.contentType = function(callback) {
  return this.mediaType(callback)
}

module.exports = Result
