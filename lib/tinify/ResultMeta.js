"use strict"

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
  return this.meta().get("image-width").then(intify).nodeify(callback)
}

ResultMeta.prototype.height = function(callback) {
  return this.meta().get("image-height").then(intify).nodeify(callback)
}

ResultMeta.prototype.location = function(callback) {
  return this.meta().get("location").nodeify(callback)
}

module.exports = ResultMeta
