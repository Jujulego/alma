module.exports = (api) => ({
  presets: [
    ['@babel/preset-env', {
      bugfixes: true,
      modules: api.env('esm') ? false : 'cjs'
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/proposal-class-properties'
  ]
});