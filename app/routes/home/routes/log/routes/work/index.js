/**
 * Created by whj on 2016/6/13.
 */
module.exports = {
    path: 'work',
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            const Work = require('./components/work')
            cb(null, Work);
        })
    }
};