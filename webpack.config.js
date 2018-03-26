var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var SplitByPathPlugin = require('webpack-split-by-path');

var r = file => path.resolve(__dirname, file[0]);

var config = {
  context: r("src"),
  entry: r`src/index.tsx`,
  output: {
    path: r`dist`,
    filename: "[name]-[hash].js",
    chunkFilename: "[name]-[hash].js"
  },
  devtool: 'source-map',
  resolve: {
    extensions: [
      '.webpack.js',
      '.web.js',
      '.ts',
      '.tsx',
      '.js'
    ]
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.(woff|woff2|eot|ttf|svg)$/i, loader: "file-loader" },
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.json$/, loader: 'file' },
      { test: /\.(jpe?g|png|gif)$/i, loaders: ['file?name=[path][name].[ext]'] }
    ] 
  },
  plugins: [

		new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery"
    }),


    // generates two bundles: One for ./src code, one for node_modules code.
    new SplitByPathPlugin([{ name: 'node_modules-bundle', path: r`node_modules` }],
      { manifest: 'app-entry' }
    ),

    // generates an index.html
    new HtmlWebpackPlugin({
      title: "crossXflow"
    })
  ]
};

module.exports = config;

