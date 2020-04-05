module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    // 'off'或0：不启用该规则; 'warn'或1：违反时警告; 'error'或2：违反时报错
    // 'always', 'never'
    'no-console': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'quotes': [1, 'single', 'avoid-escape'], // 引号风格
    'max-len': [1, 200, { 'ignoreTemplateLiterals': true }], // 强制一行的最大长度
    'space-before-function-paren': [1, {
      'anonymous': 'never', // 匿名函数表达式
      'named': 'never', // 命名函数表达式
      'asyncArrow': 'always' // 异步箭头函数表达式
    }], // function的左括号是否使用一致的空格
    'eol-last': [0, 'never'] // 文件末尾是否强制换行
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
