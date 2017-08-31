/**
 * 创建于：5/30/16
 * 创建人：杨骐彰
 * 说明：登录页路由配置
 */
module.exports = {
    path: 'login',
    getComponent(nextState, cb) {
        require.ensure([],function(){
            var  Login = require('./components/login')
            cb(null, Login);
        })
    }
};

