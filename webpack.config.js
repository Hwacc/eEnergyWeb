/**
 * 发布环境配置
 */
var webpack = require('webpack');
var webpackBaseConfig = require('./webpack.base');
var webpackBasePlugins = require('./webpack.plugins');
var htmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var vendors = ['./app/echarts-loader','jquery','react','react-router','moment'];
var path = require('path');
webpackBaseConfig.entry.vendors = vendors;
var plugins = webpackBasePlugins.concat([
    new htmlWebpackPlugin({
        template: './template/index.html',
        favicon: './template/favicon.ico'
    }),
    new ExtractTextPlugin('style-[contenthash].css'),
    new webpack.optimize.UglifyJsPlugin({
        output: {
            comments: false,  // remove all comments
        },
        compress: {
            warnings: false
        }
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendors',
        filename: 'vendor.js'
    }),
    new CleanWebpackPlugin('./dist')

]);
var loaders = webpackBaseConfig.module.loaders;
loaders[3] = {
    test: /\.scss/,
    exclude: /node_modules/,
    loader: ExtractTextPlugin.extract('style', 'css!sass')
}
module.exports = Object.assign(webpackBaseConfig, {
    plugins: plugins,
    module: {
        loaders: loaders,
        noParse: [
            '/node_modules/jspdf/dist/jspdf.debug.js',
            '/node_modules/html2canvas/dist/html2canvas.js'
        ],
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: `[name].[chunkhash].js`,
        publicPath: './'
    }
});




