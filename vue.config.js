module.exports = {
  devServer: {
    disableHostCheck: true
  },

  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {

      // public path
      config.output.publicPath = './';

      // reserve autoprefixer
      const OptimizeCssAssetsPlugin = config.plugins
        .find(plugin => plugin.options && plugin.options.cssProcessorOptions);
      OptimizeCssAssetsPlugin.options.cssProcessorOptions.autoprefixer = { remove: false };
    }
  }
};
