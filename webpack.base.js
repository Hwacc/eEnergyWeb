/**
 * webpack 基本配置
 */

var webpack = require('webpack');
var path = require('path');

var node_modules = path.join(__dirname, 'node_modules');

module.exports = {
    entry: {
        app: './app/index.js'
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'bundle.[hash].js',
        publicPath: './'
    },
    resolve: {
        root: [
            path.resolve('./app/components'),
            path.resolve('./app'),
            path.resolve('./node_modules')
        ]
    },
    module: {
        noParse: [
            '/node_modules/jspdf/dist/jspdf.debug.js',
        ],
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    //babel插件
                    plugins: [["transform-object-assign"],
                        ["transform-runtime", {
                            "helpers": false,
                            "polyfill": true,
                            "regenerator": true,
                            "moduleName": "babel-runtime"
                        }] ],
                    presets: ["react", "es2015"],
                    compact: false
                }
            },
            {
                test: /\.css$/, // Only .css files
                loader: "style!css"
            },
            {
                test: /\.(woff|woff2|ttf|eot|svg)/,
                loader: 'url'
            },
            {
                test: /\.scss$/,
                loader: "style-loader!css-loader!sass-loader"
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: "url-loader?limit=10240"
            },
            {
                test: /\.swf$/, loader: "file"
            }
        ]
    }
}