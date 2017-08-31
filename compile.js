const webpackCompiler = require('./webpack.compiler')
const webpackConfig = require('./webpack.config')
const config = require('./compile.config')
const debug = require('debug')('compile')


const compile = () => {
    return Promise.resolve()
        .then(() => webpackCompiler(webpackConfig))
        .then(stats => {
            if (stats.warnings.length && config.compiler_fail_on_warning) {
                throw new Error('Config set to fail on warning, exiting with status code "1".')
            }
            debug('Copying static assets to build folder.')
        })
        .then(() => {
            debug('Compilation completed successfully.')
        })
        .catch((err) => {
            debug('Compiler encountered an error.', err)
            process.exit(1)
        })
};

compile();
