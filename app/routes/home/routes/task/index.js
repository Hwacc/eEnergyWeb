/**
 * 创建于：2016-6-8
 * 创建人：杨骐彰
 * 说明： 设备管理路由配置
 */

/**
 * Created by whj57 on 2017/1/4.
 */
module.exports = {
    path: 'task',
    getComponent(nextState, cb) {
        const Task = require('./components/task');
        cb(null, Task);

    },
    getChildRoutes(location, cb){
        cb(null, [
            require('./routes/timing'),
            require('./routes/warning'),
        ])
    }
};
