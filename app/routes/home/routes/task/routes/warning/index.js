/**
 * Created by 栗子哥哥 on 2017/3/16.
 */
module.exports = {
    path: 'warning',
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            const Warning = require('./components/warning')
            cb(null, Warning);
        })
    }
};