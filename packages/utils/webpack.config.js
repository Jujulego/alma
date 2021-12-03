const { WebpackPnpExternals } = require('webpack-pnp-externals');
const path = require('path');

module.exports = {
  entry: {
    main: './src/index'
  },
  output: {
    filename: 'bundle.umd.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: '@jujulego/alma-utils',
      type: 'umd'
    }
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