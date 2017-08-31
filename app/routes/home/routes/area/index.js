/**
 * 创建于：2016-6-8
 * 创建人：杨骐彰
 * 说明： 设备管理路由配置
 */

module.exports = {
    path: 'area',
    getComponent(nextState, cb) {
        cb(null, require('./components/area'));
    }
};
