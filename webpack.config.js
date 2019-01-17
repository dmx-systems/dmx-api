module.exports = {
  output: {
    filename: 'dm5.min.js',
    library: 'dm5',
    libraryTarget: 'umd'
  },
  externals: ['axios', 'vue', 'clone', 'debounce'],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
}
