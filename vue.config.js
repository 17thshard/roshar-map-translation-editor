module.exports = {
  productionSourceMap: false,
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      win: {
        target: 'portable'
      },
      mac: {
        hardenedRuntime: true,
        entitlements: 'build/entitlements.mac.plist',
        entitlementsInherit: 'build/entitlements.mac.plist'
      }
    }
  }
}
