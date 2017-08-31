/**
 * Created by qizhang on 5/1/16.
 * webpack react热替换服务器
 */

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.dev.config');
const debug = require('debug')('server')
const config_compile = require('./compile.config')

new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true
}).listen(config_compile.compiler_port, '10.9.51.91', function (err, result) {
    if (err) {
        return console.log(err);
    }
    debug(`Listening at http://10.9.51.91:${config_compile.compiler_port}/`);
});

