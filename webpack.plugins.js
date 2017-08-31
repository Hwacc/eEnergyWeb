/**
 * webpack通用插件
 */
var webpack = require('webpack');
console.log(process.env.NODE_ENV)
module.exports = [
    new webpack.DefinePlugin({
        'process.env'  : {
            'NODE_ENV' : JSON.stringify(process.env.NODE_ENV)
        },
        __LOG__: "console.log",
        __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
        __PROD__: JSON.stringify(process.env.NODE_ENV === 'production')
    })
];
