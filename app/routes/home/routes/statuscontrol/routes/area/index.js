/**
 * Created by 栗子哥哥 on 2017/3/16.
 */
module.exports = {
    path: 'area',
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            const Area = require('./components/area')
            cb(null, Area);
        })
    }
};