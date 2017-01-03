"use strict"

var nodeify = require("./compat").nodeify

function intify(v) {
  return parseInt(v, 10)
}

function ResultMeta(meta) {
  this._meta = meta
}

ResultMeta.prototype.meta = function() {
  return this._meta
}

ResultMeta.prototype.width = function(callback) {
  return nodeify(this.meta().then(function(meta) { return intify(meta["image-width"]) }), callback)
}

ResultMeta.prototype.height = function(callback) {
  return nodeify(this.meta().then(function(meta) { return intify(meta["image-height"]) }), callback)
}

ResultMeta.prototype.location = function(callback) {
  return nodeify(this.meta().then(function(meta) { return meta["location"] }), callback)
}

module.exports = ResultMeta
