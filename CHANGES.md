## 1.8.3
* add JXL to supported image formats
* add node 26 as test target

## 1.8.2
* Removed the `GET` with body HTTP call that was being made when obtaining the results of a compression and transforming at the same time. Replaced with `POST` in order to prepare for deprecation of `GET` with body interface from API.
* Updated dependencies.

## 1.8.1
* Set minimum node engine to v14 in package.json
* Update examples in README
* Test the code on node 24

## 1.8.0
* Refine convert TypeScript types and add type tests
* Replace unmaintained proxying-agent with [https-proxy-agent](https://github.com/TooTallNate/proxy-agents/tree/main/packages/https-proxy-agent)
* remove data/cacert.pem and inline the bundle in a JS file for maximum compatibility

## 1.7.0
* Added convert and transform functions
* Added function to get the file extension

## 1.6.0
* Rewrite in TypeScript to provide automatically generated and tested types.
* Drop support for NodeJS 4.0 and below (end of life).

## 1.5.0
* Retry failed requests by default.
* Drop support for NodeJS 0.12 and below (end of life).

## 1.4.0
* Support for HTTP proxies.
