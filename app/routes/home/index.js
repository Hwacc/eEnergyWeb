/**
 * 创建于：2016-5-11
 * 创建人：杨骐彰
 * 说明： 主页面路由配置
 */
import auth from 'auth'


module.exports = {
    path: 'home',
    getComponent(nextState, cb) {
        var  Home = require('./components/home')
        cb(null, Home);
    },
    indexRoute: { onEnter: (nextState, replace) => replace('/home/home') },
    getChildRoutes(location, callback) {

        var  Device = require('./routes/device'),
            System = require("./routes/system"),
            HomePage = require("./routes/home"),
            Apart = require("./routes/apart"),
            Statement = require('./routes/statement'),
            Area = require("./routes/area"),
            Status = require('./routes/statuscontrol'),
            Account = require('./routes/account'),
            AnalysisReport = require('./routes/analysisreport'),
            Compare = require('./routes/compare'),
            Rank = require('./routes/rank'),
            Management = require('./routes/management');

        callback(null, [
            Device,
            System,
            HomePage,
            Statement,
            Apart,
            Area,
            Status,
            Account,
            AnalysisReport,
            Compare,
            Management,
            Rank,
        ]);
    },
    //这里可以验证
    onEnter(nextState, replace){
        if (!auth.isAuthorized()) {
            replace({pathname: 'login'});
        }
    }
};