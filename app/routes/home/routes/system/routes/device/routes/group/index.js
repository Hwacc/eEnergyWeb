/**
 * 创建于：2016-6-13
 * 创建人：杨骐彰
 * 说明： 设备分组路由配置
 */

module.exports = {
    path: 'group',
    getComponent(nextState, cb) {
        require.ensure([],function(){
            const Group = require('./components/group')
            cb(null,Group)
        })
    }
};
