module.exports = {
  presets: [
    '@vue/app',
    [
      '@babel/preset-env', // 添加 babel-preset-env 配置
      {
        'modules': false
      }
    ]
  ]
}
