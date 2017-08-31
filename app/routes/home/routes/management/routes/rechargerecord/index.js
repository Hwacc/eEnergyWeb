/**
 * 创建于：2016-6-13
 * 创建人：杨骐彰
 * 说明： 设备分组路由配置
 */

module.exports = {
    path: 'rechargerecord',
    getComponent(nextState, cb) {
        require.ensure([],function(){
            const RechargeRecord = require('./components/rechargerecord')
            cb(null,RechargeRecord)
        })
    }
};
