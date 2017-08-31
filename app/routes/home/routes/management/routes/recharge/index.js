/**
 * 创建于：2016-6-8
 * 创建人：杨骐彰
 * 说明： 设备列表路由配置
 */

module.exports = {
    path: 'recharge',
    getComponent(nextState, cb) {
        require.ensure([],function(){
            const Recharge = require('./components/recharge')
            cb(null,Recharge)
        })
    }
};
