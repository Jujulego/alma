const { WebpackPnpExternals } = require('webpack-pnp-externals');
const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    main: './src/index'
  },
  output: {
    filename: 'alma-utils.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: '@jujulego/alma-utils',
      type: 'umd'
    }
  },
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  externals: [
    WebpackPnpExternals()
  ]
};