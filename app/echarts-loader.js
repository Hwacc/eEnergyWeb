/**
 * Export echarts as CommonJS module
 */
module.exports = require('echarts/lib/echarts');

require('echarts/lib/chart/line');
require('echarts/lib/chart/bar');
require('echarts/lib/chart/pie');
require('echarts/lib/chart/scatter')
// 引入提示框和标题组件
require('echarts/lib/component/tooltip');
require('echarts/lib/component/title');
require('echarts/lib/component/legend');
require('echarts/lib/component/visualMap');
require('echarts/lib/component/toolbox');
require('echarts/lib/component/markPoint');
require('echarts/lib/component/markLine');
require('echarts/lib/component/markArea');
require('echarts/lib/component/dataZoom');



//ie
