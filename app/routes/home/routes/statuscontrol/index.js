/**
 * Created by whj57 on 2017/1/4.
 */
module.exports = {
    path: 'status',
/*    getComponent(nextState, cb) {
        const Status = require('./components/status');
        cb(null, Status);

    },
    getChildRoutes(location, cb){
        cb(null, [
            require('./routes/list'),
            require('./routes/area'),
        ])
    }*/
    getComponent(nextState,cb){
        const Status = require('./routes/area/components/area');
        cb(null, Status);
    }
};