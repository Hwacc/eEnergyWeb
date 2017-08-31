/**
 * Created by whj on 2016/7/4.
 */
module.exports = {
    path: 'operation',
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            const Operation  = require('./components/operation');
            cb(null, Operation);
        })
    }
};