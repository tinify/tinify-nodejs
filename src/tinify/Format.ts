/**
 * Media types that images can be converted to.
 *
 * ```js
 * const tinify = require("tinify")
 *
 * tinify.fromFile("input.png")
 *   .convert({type: tinify.Format.JXL})
 *   .toFile("output.jxl")
 * ```
 *
 * Multiple types may be supplied, in which case the API returns the smallest
 * result:
 *
 * ```js
 * .convert({type: [tinify.Format.JXL, tinify.Format.WEBP]})
 * ```
 */
const Format = {
  /** WebP. */
  WEBP: "image/webp",

  /** PNG. */
  PNG: "image/png",

  /** JPEG. */
  JPEG: "image/jpeg",

  /** JPEG, an alias of `JPEG`. */
  JPG: "image/jpg",

  /** AVIF. */
  AVIF: "image/avif",

  /** JPEG XL. */
  JXL: "image/jxl",

  /** Wildcard, returns the smallest of the supported types. */
  ANY: "*/*",
} as const

export default Format
