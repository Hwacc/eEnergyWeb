/**
 * Created by whj on 2016/7/4.
 */
module.exports = {
    path: 'community',
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            const Community  = require('./components/community');
            cb(null, Community);
        })
    }
};