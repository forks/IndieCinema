const path = require('path')
const webpack = require('webpack')
const projectRoot = path.resolve(__dirname, '../')

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: ['./client/main.js'],
  output: {
    path: path.resolve(__dirname, '../public/assets/build/'),
    publicPath: '/assets/build/',
    filename: 'build.js'
  },
  resolve: {
    extensions: ['', '.js', '.vue']
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
  module: {
    preLoaders: [{
      test: /\.vue$/,
      loader: 'eslint',
      include: projectRoot,
      exclude: /node_modules/
    }, {
      test: /\.js$/,
      loader: 'eslint',
      include: projectRoot,
      exclude: /node_modules/
    }],
    loaders: [{
      test: /\.vue$/,
      loader: 'vue'
    }, {
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/
    }, {
      test: /\.json$/,
      loader: 'json'
    }, {
      test: /\.html$/,
      loader: 'vue-html'
    }, {
      test: /\.(png|jpg|gif|svg)$/,
      loader: 'url',
      query: {
        limit: 10000,
        name: '[name].[ext]?[hash]'
      }
    }]
  },
  vue: {
    loaders: {
      css: ExtractTextPlugin.extract(['css']),
      scss: ExtractTextPlugin.extract(['css', 'sass'])
    }
  },
  eslint: {
    formatter: require('eslint-friendly-formatter')
  },
  plugins: [
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../public/index.html'),
      template: path.resolve(__dirname, '../public/index_dev.ejs'),
      analytics: true,
      inject: true
    }),
    new ExtractTextPlugin('style.css')
  ],
  devtool: '#eval-source-map'
}

module.exports.devtool = '#source-map'
  // http://vuejs.github.io/vue-loader/workflow/production.html
module.exports.plugins = (module.exports.plugins || []).concat([
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"production"'
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }),
  new webpack.optimize.OccurenceOrderPlugin()
])
