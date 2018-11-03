module.exports = {
  lintOnSave: false,
  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 8080,
    // https: true,
    hot: true,
    disableHostCheck: true
  }
};
