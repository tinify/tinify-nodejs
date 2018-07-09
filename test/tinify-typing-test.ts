import tinify from ".."

tinify.key = "YOUR_API_KEY"
tinify.proxy = "http://user:pass@192.168.0.1:8080"

async function run() {
  try {
    await tinify.validate()

    await tinify.fromFile("/foo/bar").toFile("/foo/bar")
    await tinify.fromBuffer(Buffer.from("foobar")).toBuffer()
    await tinify.fromUrl("https://tinypng.com/images/panda-happy.png").toBuffer()

    await tinify.fromBuffer("foo")
      .resize({method: "fit", width: 150, height: 100})
      .preserve("copyright", "creation")
      .preserve(["copyright", "creation"])
      .store({service: "s3", aws_access_key_id: "X", aws_secret_access_key: "X", path: "X"})
  } catch (err) {
    if (err instanceof tinify.AccountError) {
      console.log("The error message is: " + err.message)
    } else if (err instanceof tinify.ClientError) {
    } else if (err instanceof tinify.ServerError) {
    } else if (err instanceof tinify.ConnectionError) {
    } else {
    }
  }

  console.log(tinify.compressionCount)
}
