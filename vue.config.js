const path = require('path')

module.exports = {
  lintOnSave: true,

  publicPath: './',

  chainWebpack: config => {
    config
      .output
      .filename('js/[name].js?[hash]')
      .chunkFilename('js/[name].js?[hash]')
      .end()

    config.resolve.alias.set(
      'img',
      path.join(__dirname, 'src/assets/img')
    )

    // 忽略的打包文件
    // config.externals({
    //   'element-ui': 'ELEMENT'
    // })

    const plugins = config.plugins
    plugins.delete(`prefetch`)
    plugins.delete(`preload`)
  },
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      try {
        const terserOptions = config.optimization.minimizer[0].options.terserOptions
        const compress = terserOptions.compress
        terserOptions.compress = {
          ...compress,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        }
      } catch (e) {
        console.error(e)
      }
    }
  },

  productionSourceMap: false,
  filenameHashing: true,

  css: {
    extract: true,
    sourceMap: false
  },

  devServer: {
    port: 8086,
    https: false,
    hotOnly: false,
    proxy: null
  }
}
