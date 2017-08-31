/**
 * 创建于：2016-6-8
 * 创建人：杨骐彰
 * 说明： 设备列表路由配置
 */

module.exports = {
    path: 'ab',
    getComponent(nextState, cb) {
        require.ensure([],function(){
            const AB = require('./components/ab')
            cb(null,AB)
        })
    }
};
