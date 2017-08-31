/**
 * Created by Hwa on 2017/4/6.
 */
module.exports = {
    path: 'location',
    getComponent(nextState, cb) {
        cb(null, require('./components/location'));
    }
};