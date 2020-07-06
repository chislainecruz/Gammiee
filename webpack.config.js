const path = require('path');

module.exports = {
  entry: ['babel-polyfill', './public/game.js'],
  output: {
    path: __dirname,
    filename: './public/bundle.js'
  },
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'client')
        ],
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  }
};
