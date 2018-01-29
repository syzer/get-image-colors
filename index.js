const getPixels = require('get-pixels')
const getRgbaPalette = require('get-rgba-palette')
const getSvgColors = require('get-svg-colors')
const pify = require('pify')

const patterns = {
  image: /\.(gif|jpg|png|svg)$/i,
  raster: /\.(gif|jpg|png)$/i,
  svg: /svg$/i
}

function colorPalette (input, type, callback) {
  if (typeof type === 'function') {
    callback = type
    type = null
  }

  // SVG
  if (!Buffer.isBuffer(input)) {
    if (input.match(patterns.svg)) {
      return callback(null, getSvgColors(input, { flat: true }))
    }
  } else if (type === 'image/svg+xml') {
    return callback(null, getSvgColors(input, { flat: true }))
  }

  // PNG, GIF, JPG
  return paletteFromBitmap(input, type, callback)
}

function paletteFromBitmap (filename, type, callback) {
  if (!callback) {
    callback = type
    type = null
  }

  getPixels(filename, type, function (err, pixels) {
    if (err) return callback(err)
    // palette.bins(pixels[, count, quality, filter])
    const palette = getRgbaPalette.bins(pixels.data, 5)
      .map(({ color, amount }) => ({
        rgb: color,
        amount
      }))

    return callback(null, palette)
  })
}

module.exports = pify(colorPalette)
