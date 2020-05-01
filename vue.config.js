const path = require('path')
const argv = require('yargs').argv

// cdn配置列表
const CdnConfig = {
  prod: {
    js: [
      '//unpkg.com/vue@2.6.11/dist/vue.min.js',
      '//unpkg.com/vue-router@3.1.5/dist/vue-router.min.js',
      '//unpkg.com/vuex@3.1.2/dist/vuex.min.js',
      '//unpkg.com/axios@0.19.2/dist/axios.min.js',
      '//unpkg.com/element-ui@2.13.0/lib/index.js'
    ],
    css: [
      '//unpkg.com/element-ui@2.13.0/lib/theme-chalk/index.css'
    ]
  }
}

module.exports = {
  lintOnSave: true,

  publicPath: process.env.NODE_ENV === 'production' ? '/peotry/' : './',

  chainWebpack: config => {
    // config
    //   .output
    //   .filename('js/[name].js?[hash]')
    //   .chunkFilename('js/[name].js?[hash]')
    //   .end()

    // alias注册
    config.resolve.alias
      .set('@_api', path.resolve('src/api'))
      .set('@_components', path.resolve('src/components'))
      .set('@_assets', path.resolve('src/assets'))
      .set('@_utils', path.resolve('src/utils'))

    // 去除预加载
    const plugins = config.plugins
    plugins.delete('prefetch')
    plugins.delete('preload')

    if (argv.analyzer) {
      config.plugin('webpack-bundle-analyzer')
        .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    }

    // production模式直接引入cdn
    if (process.env.NODE_ENV === 'production') {
      // 忽略的打包文件
      config.externals({
        'vue': 'Vue',
        'vue-router': 'VueRouter',
        'vuex': 'Vuex',
        'axios': 'axios',
        'element-ui': 'ELEMENT'
      })

      // webpack配置cdn
      config.plugin('html').tap(args => {
        args[0].cdn = CdnConfig.prod
        return args
      })
    }
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
    port: 8080,
    // https: false,
    // hotOnly: false,
    proxy: {
      '/sapi/': {
        target: 'http://localhost:8085',
        ws: false,
        secure: true,
        changeOrigin: true,
        pathRewrite: {
          '/sapi': ''
        }
      }
    }
  }
}
