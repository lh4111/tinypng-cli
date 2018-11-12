# tinypnc-cli
Use the upload api of tinypng's homeage to compress images, so can use it without key.
## Install

```bash
npm i -g tinypng-cli
```

## Useage
```bask
tinypng srouce<dir|file> [outputDir] // outputDir must exist

// default outputDir is same as source
tinypng ./src/img

tinypng ./src/img ./src/compressed
```