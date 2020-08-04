module.exports = {
  output: {
    filename: 'dmx-api.min.js',
    library: 'dmx-api',
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
