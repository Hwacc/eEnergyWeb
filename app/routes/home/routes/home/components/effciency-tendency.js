/**
 * Created by whj57 on 2016/12/1.
 */
import React,{Component} from 'react'
import moment from 'moment'
import icons from 'icons'


var echarts = require('echarts-loader');
// 引入 ECharts 主模块 //todo:这样IE会出错
//var echarts = require('echarts/lib/echarts');
//require('echarts/lib/chart/line');
//require('echarts/lib/chart/bar');
// 引入提示框和标题组件
//require('echarts/lib/component/tooltip');
//require('echarts/lib/component/title');
//require('echarts/lib/component/legend');

function _getBaseSettings(dataLength) {
    return {
        color: ['#52caff', '#fd8888', '#ffd271', '#93efb2'],
        backgroundColor: '#fff',
        textStyle: {
            fontFamily: 'Helvetica Neue, Helvetica, Arial, PingFang SC, Hiragino Sans GB, WenQuanYi Micro Hei, Microsoft Yahei, sans-serif'
        },
        title: {
            text: '最近30天',
            textStyle: {
                fontSize: 16,
                color:'#33363F',
                fontWeight: 'bold',
                fontStyle: 'normal',
                fontFamily: 'Helvetica Neue, Helvetica, Arial, PingFang SC, Hiragino Sans GB, WenQuanYi Micro Hei, Microsoft Yahei, sans-serif'
            },
            left: 'center',
            top: 0
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                animation: false,
                type: 'shadow'
            },
            formatter:function(a){
                if(a[0]&&a[0].dataIndex>=0){
                    return moment(a[0].name).format('YYYY年M月D日')+'<br/>'
                        +'用电量:'+ a[0].data + 'kWh'
                }
            }
        },
        dataZoom:{
            type: 'inside',
            xAxisIndex: 0,
            filterMode: 'filter',
            startValue:dataLength - 11,
            endValue:dataLength-1,
            zoomLock:true,
        },
        grid: {
            left: 10,
            right: 10,
            bottom: 0,
            top: 50,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            name: '',
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
        yAxis: [
            {
            type: 'value',
            boundaryGap: ['0', '20%'],
            minInterval:.1,
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
                show:false,
                lineStyle: {
                    color: '#aaa'
                }
            },
            axisTick: {
                lineStyle: {
                    color: '#aaa'
                }
            }
        },{

            type: 'value',
            name: '',
            splitLine: {
                show: false
            },
            axisLabel: {
                show:false,
                textStyle: {
                    fontSize: 14
                }
            },
            axisLine: {
                show:false,
                lineStyle: {
                    color: '#aaa'
                }
            },
            axisTick: {
                show: false
            }
        }],
        series: []
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
        let _baseSettings = _getBaseSettings(data.length);
        _baseSettings.series = [];
        let _seriesBase = {
            type: 'line',
            symbol: 'circle',
            symbolSize: 10,
            lineStyle: {
                normal: {
                    width: 3
                }
            },
            name: '用电量',
            data: data.length&&data.map((t)=> {
                return t.TotalEle.toFixed(2)
            }),
            smooth: true,
            areaStyle:{
                normal:{
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0, color: 'rgba(82,202,255,1)' // 0% 处的颜色
                    }, {
                        offset: 1, color: 'rgba(82,202,255,0)' // 100% 处的颜色
                    }], false)
                }
            }
        };
        _baseSettings.title.text = '最近30天';
        _baseSettings.tooltip.axisPointer.type = 'line';
        _baseSettings.tooltip.axisPointer.lineStyle = {
            color: '#999'
        };
        _baseSettings.xAxis.type = 'category';

        //火狐时间格式兼容
     
        let xTime  = data.map(t=>{
            return t.StatisticTime
        });
        
        
        if(searchType==0){
            _baseSettings.xAxis.data = data.map((t) => {
                return moment(t.StatisticTime).format('YYYY');
            });
            _baseSettings.xAxis.name= '年';
            _baseSettings.tooltip.formatter = function(a){
                if(a[0]&&a[0].dataIndex>=0){
                    return moment(a[0].name).format('YYYY年')+'<br/>'
                        +'用电量:'+ a[0].data + 'kWh'
                }
            };
            _baseSettings.series.push(Object.assign({}, _seriesBase, {
                markPoint: {
                    label:{
                        normal:{
                            formatter: function (obj) {
                                let  time = xTime[obj.data.coord[0]];
                                return moment(time).format('YYYY年')+'\n\n用电量'+' '+':'+' '+obj.value
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
                            symbolSize:[100,56],
                            symbolOffset:[0,-30]
                        }
                    ]
                }
            }));


        }else if(searchType==1){

            _baseSettings.xAxis.data = data.map((t) => {
                return t.StatisticTime;
            });
            _baseSettings.xAxis.name= '月';
            _baseSettings.tooltip.formatter = function(a){
                if(a[0]&&a[0].dataIndex>=0){
                    return moment(a[0].name).format('YYYY年M月')+'<br/>'
                        +'用电量:'+ a[0].data + 'kWh'
                }
            };
            _baseSettings.xAxis.axisLabel.formatter = function (xData) {
                if(xData){
                    if (moment(xData).format('M') == 1) {
                        let data = moment(xData).format('M')
                        let year = moment(xData).format('YYYY年')
                        return data + '\n' + year
                    } else {
                        return moment(xData).format('M')
                    }
                }
              
            };

            _baseSettings.series.push(Object.assign({}, _seriesBase, {
                markPoint: {
                    label:{
                        normal:{
                            formatter: function (obj) {
                                let  time = xTime[obj.data.coord[0]];
                                return moment(time).format('YYYY年M月')+'\n\n用电量'+' '+':'+' '+obj.value
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
                            symbolSize:[100,56],
                            symbolOffset:[0,-30]
                        }
                    ]
                }
            }));
        }else if(searchType==2){
            _baseSettings.xAxis.data = data.map((t, i) => {
                return t.StatisticTime
            });
            _baseSettings.xAxis.name=data.length&&'日';
            _baseSettings.tooltip.formatter = function(a){
                if(a[0]&&a[0].dataIndex>=0){
                    return moment(a[0].name).format('YYYY年M月D日')+'<br/>'
                        +'用电量:'+ a[0].data + 'kWh'
                }
            };
            _baseSettings.xAxis.axisLabel.formatter = function (xData) {
                if(xData){
                    if (moment(xData).format('D') == 1) {
                        let data = moment(xData).format('D日')
                        let month = moment(xData).format('M月')
                        return data + '\n' + month
                    } else {
                        return moment(xData).format('D')
                    }
                }
               
            };
        /*    _baseSettings.xAxis.axisLabel.interval = function (index, data) {
                if (moment(new Date(data)).format('D') == 1) {
                    return true
                }
                if (index % 2 == 0) {
                    return true
                } else {
                    return false
                }
            };*/
            
            _baseSettings.series.push(Object.assign({}, _seriesBase, {
                markPoint: {
                    label:{
                        normal:{
                            formatter: function (obj) {
                                let  time = xTime[obj.data.coord[0]];
                                return moment(time).format('YYYY年M月D日')+'\n\n用电量'+' '+':'+' '+obj.value
                            },
                            position: 'insideTopLeft',
                            textStyle:{
                                fontSize: 12
                            }
                        }
                    },
                    /*data: [
                        {
                            type: 'max',
                            name: '最大值',
                            symbol:`image://${icons.background}`,
                            symbolSize:[100,56],
                            symbolOffset:[0,-30]
                        }
                    ]*/
                },
            }));

            _baseSettings.series.push({
                name:"平均气温",
                type: 'line',
                yAxisIndex: 1,
                symbol: 'circle',
                symbolSize: 5,
                smooth: false,
                label: {
                    normal: {
                        position: 'top',
                        show: true,
                        textStyle:{
                            color:'#000000'
                        },
                        formatter: '{c}℃'
                    }
                },
                lineStyle:{
                    normal:{
                        color:'#e2d9d9',
                        width: 2,
                        type:'dashed'
                    }
                },
                itemStyle:{
                    normal:{
                        color:'#bfbfbf'
                    }
                },
                markPoint:{
                    symbol: 'rect',
                },
                data: data.map(t=>{
                    return t.Temp;
                })
            })
        }else{
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

            _baseSettings.series.push(Object.assign({}, _seriesBase, {
                markPoint: {
                    label:{
                        normal:{
                            formatter: function (obj) {
                                let  time = xTime[obj.data.coord[0]];
                                return moment(time).format('YYYY年M月D日 H时')+'\n\n用电量'+' '+':'+' '+obj.value
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
        }
       
        var myChart = echarts.init(this.refs.chart);
        // 绘制图表
        myChart.setOption(_baseSettings);
        return myChart;
    }
    componentDidMount() {
        const {data,searchType} = this.props;
        this.charts = this.drawMonth(data,searchType);
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
