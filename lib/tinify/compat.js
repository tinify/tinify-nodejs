module.exports.Promise = global.Promise || require("es6-promise").Promise

var fs = require("fs")
module.exports.promisify = require("es6-promisify")
module.exports.nodeify = require("promise-nodeify")
module.exports.readFile = module.exports.promisify(fs.readFile)
module.exports.writeFile = module.exports.promisify(fs.writeFile)
module.exports.assign = Object.assign || require("util")._extend
