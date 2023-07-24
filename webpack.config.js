var path = require('path');

module.exports = {
  optimization: {
    minimize: false
  },
  target: 'node',
  entry: './src/bin/www.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  node: '12',
                },
              },
            ],
          ],
        },
      },
    ],
  },
  resolveLoader: {
    modules: [__dirname + '/node_modules'],
  },
};