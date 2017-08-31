/**
 * Created by whj57 on 2016/11/30.
 */
export const asyLoadLib = () => new Promise((resolve)=> {
    require.ensure([], (require)=> {
        if (!window.echarts) {
            window.echarts = require('echarts');
        }
        resolve(window.Highcharts);
    }, 'echarts');
});
module.exports = asyLoadLib