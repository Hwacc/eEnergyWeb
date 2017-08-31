/**
 * Created by whj57 on 2016/11/16.
 */
module.exports = {
    path: 'statement',
    getComponent(nextState, cb) {
        const Statement = require('./components/statement');
        cb(null, Statement);

    }
};
