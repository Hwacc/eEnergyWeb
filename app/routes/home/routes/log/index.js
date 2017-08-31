/**
 * Created by whj on 2016/6/13.
 */
module.exports = {
    path: 'log',
    getComponent(nextState, cb) {
        var Log = require('./components/log')
        cb(null,Log)
    },
    getChildRoutes(location, cb){
        cb(null, [
            require('./routes/operation'),
            require('./routes/work'),
            require('./routes/warn'),
        ])
    }
};