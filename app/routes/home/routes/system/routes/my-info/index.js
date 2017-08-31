/**
 * Created by whj on 2016/6/13.
 */
module.exports = {
    path: 'myinfo',
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            const UserManage = require('./components/myInfo');
            cb(null, UserManage);
        })
    }
};