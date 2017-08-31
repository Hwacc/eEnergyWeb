1/**
 * 开发环境配置
 */
var webpack = require('webpack');
var webpackBaseConfig = require('./webpack.base');
var webpackBasePlugins = require('./webpack.plugins');
var path = require('path');
var config = require('./compile.config')
var loaders = webpackBaseConfig.module.loaders.concat([]);
loaders.unshift({test: /\.jsx?$/, loaders: ['react-hot'], include: path.join(__dirname, 'app')});

var plugins = webpackBasePlugins.concat([
    new webpack.HotModuleReplacementPlugin()
]);

module.exports = {
    devtool: 'eval',
    entry: [
        `webpack-dev-server/client?http://10.9.51.91:${config.compiler_port}`, // WebpackDevServer host and port
        'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
        './app/index' // Your appʼs entry point
    ],
    resolve: webpackBaseConfig.resolve,
    output: {
        path: path.join(__dirname, 'public'),
        filename: 'bundle.js',
        publicPath: `http://10.9.51.91:${config.compiler_port}/public/`
    },
    module: {
        noParse: [
            path.join(__dirname,'node_modules/html2canvas/dist/html2canvas.js'),
        ],
        loaders: loaders
    },
    plugins: plugins
};
