/**
 * Created by whj on 2016/6/13.
 */
module.exports = {
    path: 'system',
    getComponent(nextState, cb) {
        var System = require('./components/system')
        cb(null,System)
    },
    getChildRoutes(location, cb){
        cb(null, [
            require('./routes/usermanage'),
            require('./routes/rolemanage'),
            require('./routes/community'),
            require('./routes/my-info'),
            require('./routes/device'),
            
        ])
    }
};