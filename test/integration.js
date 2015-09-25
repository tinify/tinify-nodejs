"use strict"

if (process.env.TRAVIS_PULL_REQUEST && process.env.TRAVIS_PULL_REQUEST !== "false") process.exit()

if (!process.env.TINIFY_KEY) {
  console.log("Set the TINIFY_KEY environment variable.")
  process.exit(1)
}

var tinify = require("../lib/tinify")
var assert = require("chai").assert
var tmp = require("tmp")
var fs = require("fs")

describe("client integration", function() {
  var optimized

  before(function() {
    tinify.key = process.env.TINIFY_KEY

    var unoptimizedPath = __dirname + "/examples/voormedia.png"
    optimized = tinify.fromFile(unoptimizedPath)
  })

  it("should compress", function() {
    var file = tmp.fileSync()
    return optimized.toFile(file.name).then(function() {
      assert.isBelow(fs.statSync(file.name).size, 1500)
    })
  })

  it("should resize", function() {
    var file = tmp.fileSync()
    return optimized.resize({ method: "fit", width: 50, height: 20 }).toFile(file.name).then(function() {
      assert.isBelow(fs.statSync(file.name).size, 800)
    })
  })
})
