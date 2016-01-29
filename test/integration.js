"use strict"

if (!process.env.TINIFY_KEY) {
  console.log("Set the TINIFY_KEY environment variable.")
  process.exit(1)
}

var tinify = require("../lib/tinify")
var assert = require("chai").assert
var tmp = require("tmp")
var fs = require("fs")

describe("client integration", function() {
  this.timeout(5000)

  var optimized

  before(function() {
    tinify.key = process.env.TINIFY_KEY

    var unoptimizedPath = __dirname + "/examples/voormedia.png"
    optimized = tinify.fromFile(unoptimizedPath)
  })

  it("should compress from file", function() {
    var file = tmp.fileSync()
    return optimized.toFile(file.name).then(function() {
      assert.isAbove(fs.statSync(file.name).size, 0)
      assert.isBelow(fs.statSync(file.name).size, 1500)
    })
  })

  it("should compress from url", function() {
    var source = tinify.fromUrl("https://raw.githubusercontent.com/tinify/tinify-nodejs/master/test/examples/voormedia.png")
    var file = tmp.fileSync()
    return source.toFile(file.name).then(function() {
      assert.isAbove(fs.statSync(file.name).size, 0)
      assert.isBelow(fs.statSync(file.name).size, 1500)
    })
  })

  it("should resize", function() {
    var file = tmp.fileSync()
    return optimized.resize({ method: "fit", width: 50, height: 20 }).toFile(file.name).then(function() {
      assert.isAbove(fs.statSync(file.name).size, 0)
      assert.isBelow(fs.statSync(file.name).size, 800)
    })
  })
})
