/**
 * Created by whj on 2016/6/13.
 */
module.exports = {
    path: 'rolemanage',
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            const RoleManage =  require('./components/rolemanage');
            cb(null, RoleManage);
        })
    }
};