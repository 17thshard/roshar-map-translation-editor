module.exports = {
  productionSourceMap: false,
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js'
    }
  }
}
