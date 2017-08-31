/**
 * Created by 栗子哥哥 on 2017/1/10.
 */
module.exports = {
    path: 'account',
    getComponent(nextState, cb) {
        cb(null, require('./components/account'));
    }
};