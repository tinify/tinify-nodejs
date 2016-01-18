"use strict"

var tinify = require("../lib/tinify")
var assert = require("chai").assert
var nock = require("nock")

describe("Client", function() {
  beforeEach(function() {
    this.subject = new tinify.Client("key")
  })

  describe("request", function() {
    describe("when valid", function() {
      it("should issue request", function() {
        var request = nock("https://api.tinify.com")
          .get("/")
          .reply(200, {})

        return this.subject.request("get", "/")
      })

      it("should issue request without body when options are empty", function() {
        var request = nock("https://api.tinify.com")
          .get("/", "")
          .reply(200, {})

        return this.subject.request("get", "/", {})
      })

      it("should issue request without content type when options are empty", function() {
        var request = nock("https://api.tinify.com", {
          badheaders: ["content-type"]
        }).get("/", "")
          .reply(200, {})

        return this.subject.request("get", "/", {})
      })

      it("should issue request with json body", function() {
        var request = nock("https://api.tinify.com", {
          reqheaders: {
            "content-type": "application/json",
            "content-length": "17",
          }
        }).get("/", {hello: "world"})
          .reply(200, {})

        return this.subject.request("get", "/", {hello: "world"})
      })

      it("should issue request with user agent", function() {
        var request = nock("https://api.tinify.com", {
          reqheaders: {"user-agent": tinify.Client.prototype.USER_AGENT}
        }).get("/")
          .reply(200, {})

        return this.subject.request("get", "/")
      })

      it("should update compression count", function() {
        var request = nock("https://api.tinify.com")
          .get("/")
          .reply(200, {}, {"Compression-Count": "12"})

        return this.subject.request("get", "/").then(function() {
          assert.equal(tinify.compressionCount, 12)
        })
      })

      describe("with app id", function() {
        beforeEach(function() {
          this.subject = new tinify.Client("key", "TestApp/0.1")
        })

        it("should issue request with user agent", function() {
          var request = nock("https://api.tinify.com", {
            reqheaders: {"user-agent": tinify.Client.prototype.USER_AGENT + " TestApp/0.1"}
          }).get("/")
            .reply(200, {})

          return this.subject.request("get", "/")
        })
      })
    })

    /* TODO: Test timeout/socket errors? */

    describe("with unexpected error", function() {
      var error

      beforeEach(function() {
        var request = nock("https://api.tinify.com")
          .get("/")
          .delayConnection(2000)
          .replyWithError("some error")

        return this.subject.request("get", "/").catch(function(err) {
          error = err
        })
      })

      it("should pass error", function() {
        assert.instanceOf(error, tinify.ConnectionError)
      })

      it("should pass error with message", function() {
        assert.equal(error.message, "Error while connecting: some error")
      })

      it("should pass error with stack", function() {
        assert.include(error.stack, "at Error.ConnectionError")
      })
    })

    describe("with server error", function() {
      var error

      beforeEach(function() {
        var request = nock("https://api.tinify.com")
          .get("/")
          .reply(584, '{"error":"InternalServerError","message":"Oops!"}')

        return this.subject.request("get", "/").catch(function(err) {
          error = err
        })
      })

      it("should pass server error", function() {
        assert.instanceOf(error, tinify.ServerError)
      })

      it("should pass error with message", function() {
        assert.equal(error.message, "Oops! (HTTP 584/InternalServerError)")
      })

      it("should pass error with stack", function() {
        assert.include(error.stack, "at Error.ServerError")
      })
    })

    describe("with bad server response", function() {
      var error

      beforeEach(function() {
        var request = nock("https://api.tinify.com")
          .get("/")
          .reply(543, '<!-- this is not json -->')

        return this.subject.request("get", "/").catch(function(err) {
          error = err
        })
      })

      it("should pass server error", function() {
        assert.instanceOf(error, tinify.ServerError)
      })

      it("should pass error with message", function() {
        assert.equal(error.message, "Error while parsing response: Unexpected token < (HTTP 543/ParseError)")
      })

      it("should pass error with stack", function() {
        assert.include(error.stack, "at Error.ServerError")
      })
    })

    describe("with client error", function() {
      var error

      beforeEach(function() {
        var request = nock("https://api.tinify.com")
          .get("/")
          .reply(492, '{"error":"BadRequest","message":"Oops!"}')

        return this.subject.request("get", "/").catch(function(err) {
          error = err
        })
      })

      it("should pass client error", function() {
        assert.instanceOf(error, tinify.ClientError)
      })

      it("should pass error with message", function() {
        assert.equal(error.message, "Oops! (HTTP 492/BadRequest)")
      })

      it("should pass error with stack", function() {
        assert.include(error.stack, "at Error.ClientError")
      })
    })

    describe("with bad credentials", function() {
      var error

      beforeEach(function() {
        var request = nock("https://api.tinify.com")
          .get("/")
          .reply(401, '{"error":"Unauthorized","message":"Oops!"}')

        return this.subject.request("get", "/").catch(function(err) {
          error = err
        })
      })

      it("should pass account error", function() {
        assert.instanceOf(error, tinify.AccountError)
      })

      it("should pass error with message", function() {
        assert.equal(error.message, "Oops! (HTTP 401/Unauthorized)")
      })

      it("should pass error with stack", function() {
        assert.include(error.stack, "at Error.AccountError")
      })
    })
  })
})
