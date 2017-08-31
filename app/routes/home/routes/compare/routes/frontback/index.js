/**
 * 创建于：2016-6-13
 * 创建人：杨骐彰
 * 说明： 设备分组路由配置
 */

module.exports = {
    path: 'frontback',
    getComponent(nextState, cb) {
        require.ensure([],function(){
            const FrontBack = require('./components/frontback')
            cb(null,FrontBack)
        })
    }
};
