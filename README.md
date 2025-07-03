[![NPM Version](https://img.shields.io/npm/v/tinify)](https://www.npmjs.com/package/tinify)
![NPM License](https://img.shields.io/npm/l/tinify)



# Tinify API client for Node.js

A lightweight Node.js client for the Tinify API, used for [tinypng API](https://tinypng.com) and [TinyJPG](https://tinyjpg.com). This library lets you intelligently **compress**, **resize**, **convert**, and **store** images (AVIF, WebP, JPEG, PNG) with minimal effort. Read more at [http://tinify.com](http://tinify.com).

## 🚀 Features

- Compress and optimize images in AVIF, WebP, JPEG, and PNG formats
- Resize with intelligent cropping
- Convert between formats
- Preserve metadata (copyright, GPS, creation time)
- Upload directly to Amazon S3, Google Cloud Storage, or custom S3/Azure storage

## 📖 Documentation

[Go to the full documentation for the Node.js client](https://tinypng.com/developers/reference/nodejs).

## 📦 Installation

Install the API client via NPM:

```
npm install tinify
```

Or add this to your `package.json`:

```json
{
  "dependencies": {
    "tinify": "*"
  }
}
```

## Usage

```javascript
const tinify = require("tinify");
tinify.key = "YOUR_API_KEY";

// Basic from file system
tinify.fromFile("unoptimized.png").toFile("optimized.png");

// From URL
tinify.fromUrl("https://tinypng.com/images/panda-happy.png")
  .toFile("optimized.png");

// Resize
tinify.fromFile("unoptimized.png").resize({
  method: "cover",
  width: 150,
  height: 100
}).toFile("thumbnail.jpg");

// Convert format
const source = tinify.fromFile("panda-sticker.jpg");
const converted = source.convert({type:["image/webp","image/png"]});
const extension = converted.result().extension();
extension.then(ext => {
  converted.toFile("panda-sticker." + ext);
})

// Preserve metadata
tinify.fromFile("original.jpg")
  .preserve("copyright", "location", "creation")
  .toFile("with-meta.jpg");

// Store to Amazon S3
tinify.fromFile("upload.jpg").store({
  service: "s3",
  aws_access_key_id: "KEY",
  aws_secret_access_key: "SECRET",
  region: "us-west-1",
  path: "bucket-name/images/upload.jpg"
});
```

## Running tests

```
npm install
npm test
```

### Integration tests

```
npm install
TINIFY_KEY=$YOUR_API_KEY npm run integration
```


#### To test with proxy:

    $ docker run --rm -it -v ~/.mitmproxy:/home/mitmproxy/.mitmproxy -p 8080:8080 mitmproxy/mitmproxy mitmproxy  --listen-host 0.0.0.0

    $ TINIFY_PROXY=http://172.17.0.3:8080 npm run integration

## License

This software is licensed under the MIT License. [View the license](LICENSE).
