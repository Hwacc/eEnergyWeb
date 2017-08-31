/**
 * 创建于：6/7/16
 * 创建人：杨骐彰
 * 说明：历史图表
 */

import React,{Component} from 'react'
import moment from 'moment'
import * as staticType from 'utils/staticType'

var echarts = require('echarts/dist/echarts.min');
// 引入 ECharts 主模块 //todo:这样IE会出错
//var echarts = require('echarts/lib/echarts');
//require('echarts/lib/chart/line');
//require('echarts/lib/chart/bar');
// 引入提示框和标题组件
//require('echarts/lib/component/tooltip');
//require('echarts/lib/component/title');
//require('echarts/lib/component/legend');

function _getBaseSettings() {
    return {
        color: ['#52caff', '#fd8888', '#ffd271', '#93efb2'],
        backgroundColor: '#fff',
        textStyle: {
            fontFamily: 'Helvetica Neue, Helvetica, Arial, PingFang SC, Hiragino Sans GB, WenQuanYi Micro Hei, Microsoft Yahei, sans-serif'
        },
        title: {
            text: '历史用电分析',
            textStyle: {
                fontSize: 16,
                fontWeight: 'normal',
                fontStyle: 'normal',
                fontFamily: 'Helvetica Neue, Helvetica, Arial, PingFang SC, Hiragino Sans GB, WenQuanYi Micro Hei, Microsoft Yahei, sans-serif'
            },
            left: 'center',
            top: 12
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                animation: false,
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '40',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        legend: {
            show: true,
            data: ['2014年', '2015年', '2016年'],
            bottom: 10
        },
        xAxis: {
            type: 'category',
            data: ['用电总量', '峰电', '谷电', '平电'],
            splitLine: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    fontSize: 14
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#aaa'
                }
            },
            axisTick: {
                lineStyle: {
                    color: '#aaa'
                }
            }
        },
        yAxis: {
            type: 'value',
            name: 'kwh',
            splitLine: {
                lineStyle: {
                    //type: 'dashed'
                }
            },
            axisLabel: {
                textStyle: {
                    fontSize: 14
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#aaa'
                }
            },
            axisTick: {
                lineStyle: {
                    color: '#aaa'
                }
            }
        },
        series: [
            {
                name: '2014年',
                type: 'bar',
                barWidth: 35,
                data: [3200, 1000, 1200, 1100]
            }, {
                name: '2015年',
                type: 'bar',
                barWidth: 35,
                data: [2800, 800, 900, 1100]
            }, {
                name: '2016年',
                type: 'bar',
                barWidth: 35,
                data: [3800, 1200, 1500, 1100]
            }
        ]
    };
}

export default class extends Component {
    constructor(props) {
        super(...arguments);
        this._handleResize = function () {
            this.charts && this.charts.resize();
        }.bind(this);
    }

    /**
     * 多年
     * @param data
     */
    drawYears(data) {
        let _baseSettings = _getBaseSettings();
        _baseSettings.series = data.map((t)=> {
            return {
                name: moment(t.StatisticTime).format('YYYY年'),
                type: 'bar',
                barWidth: 35,
                data: [t.PeakEle + t.ValleyEle + t.FlatEle, t.PeakEle, t.ValleyEle, t.FlatEle]
            };
        });
        _baseSettings.xAxis.data = ['用电总量', '峰电', '谷电', '平电'];
        _baseSettings.xAxis.type = 'category';
        _baseSettings.legend.data = data.map((t)=> {
            return moment(t.StatisticTime).format('YYYY年');
        });
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(this.refs.chart);
        // 绘制图表
        myChart.setOption(_baseSettings);
        return myChart;
    }

    /**
     * 1年
     * @param data
     */
    drawYear(data) {
        let _baseSettings = _getBaseSettings();
        const {time} = this.props;
        _baseSettings.series = [];

        let _seriesBase = {
            type: 'line',
            symbol: 'circle',
            symbolSize: 10,
            lineStyle: {
                normal: {
                    width: 3
                }
            }
        };

        _baseSettings.title.text = moment(time).format('YYYY年用电趋势图');

        _baseSettings.series.push(Object.assign({}, _seriesBase, {
            name: '总电',
            data: data.map((t)=> {
                return t.PeakEle + t.ValleyEle + t.FlatEle
            })
        }));
        _baseSettings.series.push(Object.assign({}, _seriesBase, {
            name: '峰电',
            data: data.map((t)=> {
                return t.PeakEle
            })
        }));
        _baseSettings.series.push(Object.assign({}, _seriesBase, {
            name: '谷电',
            data: data.map((t)=> {
                return t.ValleyEle
            })
        }));
        _baseSettings.series.push(Object.assign({}, _seriesBase, {
            name: '平电',
            data: data.map((t)=> {
                return t.FlatEle
            })
        }));

        _baseSettings.tooltip.axisPointer.type = 'line';
        _baseSettings.tooltip.axisPointer.lineStyle = {
            color: '#999'
        };

        _baseSettings.xAxis.data = data.map((t)=> {
            return moment(t.StatisticTime).format('MM月');
        });
        _baseSettings.xAxis.type = 'category';
        _baseSettings.legend.data = ['总电', '峰电', '谷电', '平电'];
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(this.refs.chart);
        // 绘制图表

        myChart.setOption(_baseSettings);
        return myChart;
    }

    /**
     * 1月
     * @param data
     */
    drawMonth(data) {
        const {time} = this.props;
        let _baseSettings = _getBaseSettings();
        _baseSettings.series = [];

        let _seriesBase = {
            type: 'line',
            symbol: 'circle',
            symbolSize: 10,
            lineStyle: {
                normal: {
                    width: 3
                }
            }
        };

        _baseSettings.title.text = moment(time).format('YYYY年MM月用电趋势图');
        _baseSettings.series.push(Object.assign({}, _seriesBase, {
            name: '总电',
            data: data.map((t)=> {
                return t.PeakEle + t.ValleyEle + t.FlatEle
            })
        }));
        _baseSettings.series.push(Object.assign({}, _seriesBase, {
            name: '峰电',
            data: data.map((t)=> {
                return t.PeakEle
            })
        }));
        _baseSettings.series.push(Object.assign({}, _seriesBase, {
            name: '谷电',
            data: data.map((t)=> {
                return t.ValleyEle
            })
        }));
        _baseSettings.series.push(Object.assign({}, _seriesBase, {
            name: '平电',
            data: data.map((t)=> {
                return t.FlatEle
            })
        }));

        _baseSettings.tooltip.axisPointer.type = 'line';
        _baseSettings.tooltip.axisPointer.lineStyle = {
            color: '#999'
        };

        _baseSettings.xAxis.data = data.map((t)=> {
            return moment(t.StatisticTime).format('DD日');
        });
        _baseSettings.xAxis.type = 'category';
        _baseSettings.legend.data = ['总电', '峰电', '谷电', '平电'];
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(this.refs.chart);
        // 绘制图表

        myChart.setOption(_baseSettings);
        return myChart;
    }

    /**
     * 1日
     * @param data
     */
    drawDay(data) {
        const {time} = this.props;
        let _baseSettings = _getBaseSettings();
        _baseSettings.series = [];
        console.log(data)
        let _seriesBase = {
            type: 'line',
            symbol: 'circle',
            symbolSize: 10,
            lineStyle: {
                normal: {
                    width: 3
                }
            }
        };

        _baseSettings.title.text = moment(time).format('YYYY年MM月DD日用电趋势图');
        _baseSettings.series.push(Object.assign({}, _seriesBase, {
            name: '总电',
            data: data.map((t)=> {
                return t.PeakEle + t.ValleyEle + t.FlatEle
            })
        }));
        _baseSettings.series.push(Object.assign({}, _seriesBase, {
            name: '峰电',
            data: data.map((t)=> {
                return t.PeakEle
            })
        }));
        _baseSettings.series.push(Object.assign({}, _seriesBase, {
            name: '谷电',
            data: data.map((t)=> {
                return t.ValleyEle
            })
        }));
        _baseSettings.series.push(Object.assign({}, _seriesBase, {
            name: '平电',
            data: data.map((t)=> {
                return t.FlatEle
            })
        }));

        _baseSettings.tooltip.axisPointer.type = 'line';
        _baseSettings.tooltip.axisPointer.lineStyle = {
            color: '#999'
        };

        _baseSettings.xAxis.data = data.map((t)=> {
            return moment(t.StatisticTime).format('HH时');
        });
        _baseSettings.xAxis.type = 'category';
        _baseSettings.legend.data = ['总电', '峰电', '谷电', '平电'];
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(this.refs.chart);
        // 绘制图表

        myChart.setOption(_baseSettings);
        return myChart;
    }

    componentDidMount() {
        const {data, type} = this.props;
        if (type === staticType.timeBaseOnEnum.multiYear) {
            this.charts = this.drawYears(data);
        }
        else if (type === staticType.timeBaseOnEnum.year) {
            this.charts = this.drawYear(data);
        }
        else if (type === staticType.timeBaseOnEnum.month) {
            this.charts = this.drawMonth(data);
        }
        else if (type === staticType.timeBaseOnEnum.day) {
            this.charts = this.drawDay(data);
        }
        window.addEventListener('resize', this._handleResize, false)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._handleResize)
        this.charts && this.charts.dispose();
    }

    render() {
        return (
            <div className="sem-panel" ref="chart" style={{height:400,width:'100%'}}>
            </div>
        );
    }
}
