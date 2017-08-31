/**
 * Created by whj57 on 2016/12/1.
 */
import React,{Component} from 'react'
import moment from 'moment'
import icons from 'icons'
import * as staticType from 'utils/staticType'
var echarts = require('echarts-loader');
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
                fontSize: 12,
                color:'#33363F',
                fontWeight: 'bold',
                fontStyle: 'normal',
                fontFamily: 'Helvetica Neue, Helvetica, Arial, PingFang SC, Hiragino Sans GB, WenQuanYi Micro Hei, Microsoft Yahei, sans-serif'
            },
            left: 'center',
            top: 5
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                animation: false,
                type: 'shadow'
            },
            formatter:function(a){
                if(a[0]&&a[0].dataIndex>=0){
                    return moment(a[0].name.replace(/-/g,'/')).format('YYYY年M月D日')+'<br/>'
                        +'用电量:'+ a[0].data + 'kWh'
                }
            }
        },

        dataZoom:{
            type: 'inside',
            xAxisIndex: 0,
            filterMode: 'empty',

        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: 0,
            containLabel: true
        },

        xAxis: {
            type: 'category',
            data: ['用电总量', '峰电', '谷电', '平电'],
            name: '日',
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
            name: 'kWh',
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
     * 1月
     * @param data
     */
    drawMonth(data,searchType) {

        let xTime = data.map(t => {
           return t.StatisticTime
        })
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
        _baseSettings.tooltip.axisPointer.type = 'line';
        _baseSettings.tooltip.axisPointer.lineStyle = {
            color: '#999'
        };
        if(searchType==3){
            _baseSettings.xAxis.data = data.map((t) => {
                return t.StatisticTime;
            });
            _baseSettings.xAxis.name= '时';
            _baseSettings.tooltip.formatter = function(a){
                if(a[0]&&a[0].dataIndex>=0){
                    return moment(a[0].name).format('YYYY年M月D日 H时')+'<br/>'
                        +'用电量:'+ a[0].data + 'kWh'
                }
            };
            _baseSettings.xAxis.axisLabel.formatter = function (xData) {
                if(xData){
                    if (moment(xData).format('H') == 0) {
                        let data = moment(xData).format('H')
                        let year = moment(xData).format('YYYY年M月D日')
                        return data + '\n' + year
                    } else {
                        return moment(xData).format('H')
                    }
                }

            };
            _baseSettings.title.text = '当日用电曲线';
            _baseSettings.series.push(Object.assign({}, _seriesBase, {
                name: '用电量',
                data: data.map((t)=> {
                    return (t.Total*1).toFixed(2)
                }),
                smooth: true,
                markPoint: {
                    label:{
                        normal:{
                            formatter: function (obj) {
                                let  time = xTime[obj.data.coord[0]];
                                let showTime = moment(time).format('M月D日H时');
                                return showTime+'\n用电量 '+':'+' '+obj.value;
                            },
                            position:'insideTopLeft'
                        }
                    },
                    data: [
                        {
                            type: 'max',
                            name: '最大值',
                            symbol:`image://${icons.background}`,
                            symbolSize:[100,40],
                            symbolOffset:[0,-30]
                        },
                        {
                            type: 'min',
                            name: '最小值',
                            symbol:`image://${icons.background}`,
                            symbolSize:[100,40],
                            symbolOffset:[0,-30]
                        }
                    ]
                },
                areaStyle:{
                    normal:{
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0, color: 'rgba(82,202,255,1)' // 0% 处的颜色
                        }, {
                            offset: 1, color: 'rgba(82,202,255,0)' // 100% 处的颜色
                        }], false)
                    }
                }
            }));

            _baseSettings.series.push(Object.assign({}, _seriesBase, {
                markPoint: {
                    label:{
                        normal:{
                            formatter: function (obj) {
                                let  time = xTime[obj.data.coord[0]];
                                return moment(time.replace(/-/g,'/')).format('YYYY年M月D日 H时')+'\n\n用电量'+' '+':'+' '+obj.value
                            },
                            position: 'insideTopLeft',
                            textStyle:{
                                fontSize: 12
                            }
                        }
                    },
                    data: [
                        {
                            type: 'max',
                            name: '最大值',
                            symbol:`image://${icons.background}`,
                            symbolSize:[120,56],
                            symbolOffset:[0,-30]
                        }
                    ]
                }
            }));
        }else if(searchType==4){
            _baseSettings.title.text = '本周用电曲线';
            _baseSettings.series.push(Object.assign({}, _seriesBase, {
                name: '用电量',
                data: data.map((t)=> {
                    return (t.Total*1).toFixed(2)
                }),
                smooth: true,
                markPoint: {
                    label:{
                        normal:{
                            formatter: function (obj) {
                                let  time = xTime[obj.data.coord[0]];
                                let showTime = moment(time.replace(/-/g,'/')).format('YYYY年M月D日');
                                return showTime+'\n用电量 '+':'+' '+obj.value;
                            },
                            position:'insideTopLeft'
                        }
                    },
                    data: [
                        {
                            type: 'max',
                            name: '最大值',
                            symbol:`image://${icons.background}`,
                            symbolSize:[100,40],
                            symbolOffset:[0,-30]
                        },
                        {
                            type: 'min',
                            name: '最小值',
                            symbol:`image://${icons.background}`,
                            symbolSize:[100,40],
                            symbolOffset:[0,-30]
                        }
                    ]
                },
                areaStyle:{
                    normal:{
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0, color: 'rgba(82,202,255,1)' // 0% 处的颜色
                        }, {
                            offset: 1, color: 'rgba(82,202,255,0)' // 100% 处的颜色
                        }], false)
                    }
                }
            }));
            //区分
            _baseSettings.xAxis.data = data.map((t, i) => {
                return t.StatisticTime
            })
            _baseSettings.xAxis.axisLabel.formatter = function (xData) {
                if(moment(xData).format('D') == 1){
                    let data = moment(xData).format('D日')
                    let month = moment(xData).format('M月')
                    return data + '\n' + month
                } else  {
                    return moment(xData).format('D')
                }

            };
            _baseSettings.xAxis.axisLabel.interval = function (index, data) {
                if(moment(data).format('D') == 1){
                    return true
                }
                if(index%2 == 0){
                    return true
                }else {
                    return false
                }

            }
            _baseSettings.xAxis.type = 'category';
            /*  _baseSettings.legend.data = ['总电'];*/
            /*  _baseSettings.xAxis.axisLabel.interval = (t)=>{
             if(t == indexYear||t == indexMonth ||t%2 == 0){
             return true;
             }
             };*/
        }
        else{
            _baseSettings.title.text = '当月用电曲线';
            _baseSettings.series.push(Object.assign({}, _seriesBase, {
                name: '用电量',
                data: data.map((t)=> {
                    return (t.Total*1).toFixed(2)
                }),
                smooth: true,
                markPoint: {
                    label:{
                        normal:{
                            formatter: function (obj) {
                                let  time = xTime[obj.data.coord[0]];
                                let showTime = moment(time.replace(/-/g,'/')).format('YYYY年M月D日');
                                return showTime+'\n用电量 '+':'+' '+obj.value;
                            },
                            position:'insideTopLeft'
                        }
                    },
                    data: [
                        {
                            type: 'max',
                            name: '最大值',
                            symbol:`image://${icons.background}`,
                            symbolSize:[100,40],
                            symbolOffset:[0,-30]
                        },
                        {
                            type: 'min',
                            name: '最小值',
                            symbol:`image://${icons.background}`,
                            symbolSize:[100,40],
                            symbolOffset:[0,-30]
                        }
                    ]
                },
                areaStyle:{
                    normal:{
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0, color: 'rgba(82,202,255,1)' // 0% 处的颜色
                        }, {
                            offset: 1, color: 'rgba(82,202,255,0)' // 100% 处的颜色
                        }], false)
                    }
                }
            }));
            //区分
            _baseSettings.xAxis.data = data.map((t, i) => {
                return t.StatisticTime
            })
            _baseSettings.xAxis.axisLabel.formatter = function (xData) {
                if(moment(xData).format('D') == 1){
                    let data = moment(xData).format('D日')
                    let month = moment(xData).format('M月')
                    return data + '\n' + month
                } else  {
                    return moment(xData).format('D')
                }

            };
            _baseSettings.xAxis.axisLabel.interval = function (index, data) {
                if(moment(data).format('D') == 1){
                    return true
                }
                if(index%2 == 0){
                    return true
                }else {
                    return false
                }

            }
            _baseSettings.xAxis.type = 'category';
            /*  _baseSettings.legend.data = ['总电'];*/
            /*  _baseSettings.xAxis.axisLabel.interval = (t)=>{
             if(t == indexYear||t == indexMonth ||t%2 == 0){
             return true;
             }
             };*/
        }
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(this.refs.chart);
        // 绘制图表
        myChart.setOption(_baseSettings);
        return myChart;
    }

    componentDidMount() {
        const { data ,searchType } = this.props
        let newData = [...data]
        this.charts = this.drawMonth(newData,searchType)
        window.addEventListener('resize', this._handleResize, false)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._handleResize)
        this.charts && this.charts.dispose();
    }

    render() {
        return (
            <div ref="chart" style={{height:'100%',width:'100%'}}>
            </div>
        );
    }
}
