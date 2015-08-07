"use strict"

var tinify = require("../lib/tinify")
var assert = require("chai").assert
var nock = require("nock")

describe("tinify", function() {
  var dummyFile = __dirname + "/examples/dummy.png"

  beforeEach(function() {
    tinify.key = null
  })

  describe("key", function() {
    beforeEach(function() {
      var request = nock("https://api.tinify.com")
        .get("/")
        .basicAuth({
          user: "api",
          pass: "fghij",
        })
        .reply(200)
    })

    it("should reset client with new key", function() {
      tinify.key = "abcde"
      tinify.client
      tinify.key = "fghij"
      return tinify.client.request("get", "/")
    })
  })

  describe("appIdentifier", function() {
    beforeEach(function() {
      var request = nock("https://api.tinify.com", {
        reqheaders: {"user-agent": tinify.Client.prototype.USER_AGENT + " MyApp/2.0"}
      }).get("/")
        .reply(200)
    })

    it("should reset client with new app identifier", function() {
      tinify.key = "abcde"
      tinify.appIdentifier = "MyApp/1.0"
      tinify.client
      tinify.appIdentifier = "MyApp/2.0"
      return tinify.client.request("get", "/")
    })
  })

  describe("client", function() {
    describe("with key", function() {
      it("should return client", function() {
        tinify.key = "abcde"
        assert.instanceOf(tinify.client, tinify.Client)
      })
    })

    describe("without key", function() {
      it("should pass error", function() {
        assert.throws(function() {
          tinify.client
        }, tinify.AccountError)
      })
    })
  })

  describe("validate", function() {
    describe("with valid key", function() {
      beforeEach(function() {
        tinify.key = "valid"

        var request = nock("https://api.tinify.com")
          .post("/shrink")
          .reply(400, '{"error":"InputMissing","message":"No input"}')

      })

      it("should return null promise", function() {
        return tinify.validate().then(function(value) {
          assert.isNull(value)
        })
      })

      it("should not pass error to callback", function(done) {
        tinify.validate(function(err) {
          assert.isNull(err)
          done()
        })
      })
    })

    describe("without key", function() {
      it("should return error promise", function() {
        return tinify.validate().catch(function(err) {
          assert.instanceOf(err, tinify.AccountError)
        })
      })

      it("should pass error to callback", function(done) {
        tinify.validate(function(err) {
          assert.instanceOf(err, tinify.AccountError)
          done()
        })
      })
    })

    describe("with error", function() {
      beforeEach(function() {
        tinify.key = "invalid"

        var request = nock("https://api.tinify.com")
          .post("/shrink")
          .reply(401, '{"error":"Unauthorized","message":"Credentials are invalid"}')
      })

      it("should return error promise", function() {
        return tinify.validate().catch(function(err) {
          assert.instanceOf(err, tinify.AccountError)
        })
      })

      it("should pass error to callback", function(done) {
        tinify.validate(function(err) {
          assert.instanceOf(err, tinify.AccountError)
          done()
        })
      })
    })
  })

  describe("fromBuffer", function() {
    beforeEach(function() {
      tinify.key = "valid"

      var request = nock("https://api.tinify.com")
        .post("/shrink")
        .reply(201, {}, { Location: "https://api.tinify.com/some/location" })
    })

    it("should return source", function() {
      var source = tinify.fromBuffer("png file")
      assert.instanceOf(source, tinify.Source)
    })
  })

  describe("fromFile", function() {
    beforeEach(function() {
      tinify.key = "valid"

      var request = nock("https://api.tinify.com")
        .post("/shrink")
        .reply(201, {}, { Location: "https://api.tinify.com/some/location" })
    })

    it("should return source", function() {
      var source = tinify.fromFile(dummyFile)
      assert.instanceOf(source, tinify.Source)
    })
  })
})
