/**
 * Created by whj57 on 2016/11/16.
 */
module.exports = {
    path: 'record',
    getComponent(nextState, cb) {
        const Record = require('./components/record');
        cb(null, Record);

    }
};
