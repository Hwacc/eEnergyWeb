/**
 * Created by 栗子哥哥 on 2017/3/16.
 */
module.exports = {
    path: 'timing',
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            const Timing = require('./components/timing')
            cb(null, Timing);
        })
    }
};