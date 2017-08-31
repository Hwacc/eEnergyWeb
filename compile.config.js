/**
 * Created by whj57 on 2016/11/30.
 */
compiler_config = {
    compiler_babel : {
        cacheDirectory : true,
        plugins        : ['transform-runtime'],
        presets        : ['es2015', 'react', 'stage-0']
    },
    compiler_port            : '3009',
    compiler_devtool         : 'source-map',
    compiler_hash_type       : 'hash',
    compiler_fail_on_warning : false,
    compiler_quiet           : false,
    compiler_public_path     : '/',
    compiler_stats           : {
        chunks : false,
        chunkModules : false,
        colors : true
    },
    compiler_vendors : [
        'react',
        'react-redux',
        'react-router',
        'redux'
    ],

}
module.exports = compiler_config