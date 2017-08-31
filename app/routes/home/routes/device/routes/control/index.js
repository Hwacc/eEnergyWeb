/**
 * 创建于：2016-6-8
 * 创建人：杨骐彰
 * 说明： 设备控制路由配置
 */

module.exports = {
    path: 'control',
    getComponent(nextState, cb) {
        require.ensure([],function(){
            const Control = require('./components/control')
            cb(null,Control)
        })
    }
};
