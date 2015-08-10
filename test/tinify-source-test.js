"use strict"

var tinify = require("../lib/tinify")
var assert = require("chai").assert
var nock = require("nock")
var tmp = require("tmp")
var fs = require("fs")

describe("Source", function() {
  var dummyFile = __dirname + "/examples/dummy.png"

  describe("with invalid api key", function() {
    beforeEach(function() {
      tinify.key = "invalid"

      var request = nock("https://api.tinify.com")
        .post("/shrink")
        .reply(401, {error: "Unauthorized", message: "Credentials are invalid"})
    })

    describe("fromFile", function() {
      it("should pass account error", function() {
        return tinify.Source.fromFile(dummyFile).toBuffer().catch(function(err) {
          assert.instanceOf(err, tinify.AccountError)
        })
      })
    })

    describe("fromBuffer", function() {
      it("should pass account error", function() {
        return tinify.Source.fromBuffer("png file").toBuffer().catch(function(err) {
          assert.instanceOf(err, tinify.AccountError)
        })
      })
    })
  })

  describe("with valid api key", function() {
    beforeEach(function() {
      tinify.key = "valid"

      var request1 = nock("https://api.tinify.com")
        .post("/shrink")
        .reply(201, {}, {location: "https://api.tinify.com/some/location"})

      var request2 = nock("https://api.tinify.com")
        .get("/some/location")
        .reply(200, "compressed file")

      var request3 = nock("https://api.tinify.com")
        .get("/some/location", '{"resize":{"width":400}}')
        .reply(200, "small file")

      var request4 = nock("https://api.tinify.com")
        .post("/some/location", '{"store":{"service":"s3"}}')
        .reply(200, {}, {location: "https://bucket.s3.amazonaws.com/example"})
    })

    describe("fromFile", function() {
      it("should return source", function() {
        var source = tinify.Source.fromFile(dummyFile)
        assert.instanceOf(source, tinify.Source)
      })

      it("should return source with data", function() {
        var data = tinify.Source.fromFile(dummyFile).toBuffer()
        return data.then(function(data) {
          assert.equal("compressed file", data)
        })
      })
    })

    describe("fromBuffer", function() {
      it("should return source", function() {
        var source = tinify.Source.fromBuffer("png file")
        assert.instanceOf(source, tinify.Source)
      })

      it("should return source with data", function() {
        var data = tinify.Source.fromBuffer("png file").toBuffer()
        return data.then(function(data) {
          assert.equal("compressed file", data)
        })
      })
    })

    describe("result", function() {
      it("should return result", function() {
        var result = tinify.Source.fromBuffer("png file").result()
        assert.instanceOf(result, tinify.Result)
      })
    })

    describe("resize", function() {
      it("should return source", function() {
        var source = tinify.Source.fromBuffer("png file").resize({width: 400})
        assert.instanceOf(source, tinify.Source)
      })

      it("should return source with data", function() {
        var data = tinify.Source.fromBuffer("png file").resize({width: 400}).toBuffer()
        return data.then(function(data) {
          assert.equal("small file", data)
        })
      })
    })

    describe("store", function() {
      it("should return result meta", function() {
        var result = tinify.Source.fromBuffer("png file").store({service: "s3"})
        assert.instanceOf(result, tinify.ResultMeta)
      })

      it("should return result meta with location", function() {
        var location = tinify.Source.fromBuffer("png file").store({service: "s3"}).location()
        return location.then(function(location) {
          assert.equal("https://bucket.s3.amazonaws.com/example", location)
        })
      })
    })

    describe("toBuffer", function() {
      it("should return image data", function() {
        var data = tinify.Source.fromBuffer("png file").toBuffer()
        return data.then(function(data) {
          assert.equal("compressed file", data)
        })
      })
    })

    describe("toFile", function() {
      it("should store image data", function() {
        var file = tmp.fileSync()
        var promise = tinify.Source.fromBuffer("png file").toFile(file.name)
        return promise.then(function() {
          assert.equal("compressed file", fs.readFileSync(file.name))
        })
      })
    })
  })
})
