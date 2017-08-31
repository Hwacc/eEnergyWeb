/**
 * Created by whj on 2016/6/13.
 */
module.exports = {
    path: 'usermanage',
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            const UserManage = require('./components/usermanage')
            cb(null, UserManage);
        })
    }
};