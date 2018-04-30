module.exports = {
  output: {
    filename: 'dm5.js',
    libraryTarget: 'commonjs2'
  },
  externals: ['axios', 'vue', 'clone'],
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
