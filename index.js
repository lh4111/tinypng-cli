#! /usr/bin/env node
const request = require('request')
const fs = require('fs')

const [, ,source, output = source] = process.argv

showBanner()

const total = {
  input: 0,
  output: 0
}
if (fs.statSync(source).isDirectory()) {
  if (!fs.statSync(output).isDirectory()) {
    console.error('output must be a directory')
    return
  }
  compressDir(source, output)
} else if (source.match(/(\.png|\.jpg|\.jpeg)$/)) {
  compress(source, output)
}

function compressDir(sourceDir, outputDir) {
  const files = fs.readdirSync(sourceDir).filter(fileName => fileName.match(/(\.png|\.jpg|\.jpeg)$/)).map(fileName => {
    return compress(`${sourceDir}/${fileName}`, `${outputDir}/${fileName}`)
  })
  Promise.all(files).then(() => {
    console.log('——————————————————————————————————————')
    console.log(`Total Saved: ${toKb(total.input-total.output)} ${((total.input-total.output) / total.input).toFixed()}%`)
  })
}

function compress(sourcePath, outputPath) {
  return new Promise((resolve, reject) => {
    request({
      method: 'POST',
      url: 'https://tinypng.com/web/shrink',
      headers: {
        'cache-control': 'no-cache',
        'Content-Type': 'application/octet-stream',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
      },
      body: fs.createReadStream(sourcePath),
      encoding: 'utf8'
    }, function (error, response, body) {
      if (error) throw new Error(error)
      body = JSON.parse(body)
      request(body.output.url)
        .pipe(fs.createWriteStream(outputPath))
        .on('close', () => {
          if (error) throw new Error(error)
          total.input += body.input.size
          total.output += body.output.size
          console.log(`${sourcePath}\tsource:${toKb(body.input.size)}\tcompressed:${toKb(body.output.size)}\tsaved: ${toKb(body.input.size-body.output.size)}\t${((1 - body.output.ratio)* 100).toFixed()}%`)
          resolve()
      })
    })
  })
}

function showBanner() {
  console.log(`
████████╗██╗███╗   ██╗██╗   ██╗██████╗ ███╗   ██╗ ██████╗
╚══██╔══╝██║████╗  ██║╚██╗ ██╔╝██╔══██╗████╗  ██║██╔════╝
   ██║   ██║██╔██╗ ██║ ╚████╔╝ ██████╔╝██╔██╗ ██║██║  ███╗
   ██║   ██║██║╚██╗██║  ╚██╔╝  ██╔═══╝ ██║╚██╗██║██║   ██║
   ██║   ██║██║ ╚████║   ██║   ██║     ██║ ╚████║╚██████╔╝
   ╚═╝   ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝     ╚═╝  ╚═══╝ ╚═════╝
}`)
}

function toKb(byte) {
  return (byte / 1024).toFixed(1) + 'k'
}