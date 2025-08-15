const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Enable CSS support for web
  config.module.rules.push({
    test: /\.css$/i,
    use: ['style-loader', 'css-loader'],
  });

  return config;
};
