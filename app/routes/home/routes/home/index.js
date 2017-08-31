/**
 * Created by whj57 on 2016/12/1.
 */
module.exports = {
    path: 'home',
    getComponent(nextState, cb) {
        require.ensure([],()=>{
            var Home = require('./components/home')
            cb(null,Home)
        })
    }
};