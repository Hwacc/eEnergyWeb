/**
 * Created by whj57 on 2016/12/1.
 */
import React,{Component} from 'react'
var echarts = require('echarts-loader');
import BaseComponent from 'basecomponent'
import moment from'moment'
import * as staticType from 'utils/staticType'

function _getBaseSettings() {
    return {
        title:{
            text: '用能柱状图',
            textAlign: 'left',
            textStyle:{
                fontSize: 16,
                color:'#434343',
                fontWeight: 'bold'
            }
        } ,
        textStyle: {
            fontFamily: 'Helvetica Neue, Helvetica, Arial, PingFang SC, Hiragino Sans GB, WenQuanYi Micro Hei, Microsoft Yahei, sans-serif',
            fontSize:'18px'
        },
        tooltip: {

            trigger: 'axis',
            axisPointer: {
                animation: false,
                type: 'line',
                lineStyle:{
                    color:'#52caff'
                }
            }
        },
     /*   visualMap: {
            show: false,
            min:0,
            max:10,
            dimension:0,
            inRange: {
                color: ['#52caff','#fd8888']
            }
        },*/
        grid: {
            left: '2%',
            right: '4%',
            bottom: 20,
            containLabel: true
        },
        dataZoom:{
            type: 'inside',
            xAxisIndex: 0,
            filterMode: 'empty',
        },
        legend:{
            data:['日均用电量','平均气温'],
            bottom: -5,
            itemHeight:10,
            itemWidth: 20,
            textStyle: {
                fontSize: 12
            }

        },
        xAxis: {
            type: 'category',
            data: [],
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
                show: false,
                lineStyle: {
                    color: '#aaa'
                }
            }
        },
        yAxis: [{
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

export default class FrontBackCharts extends BaseComponent {
    constructor(props){
        super(...arguments);
        this._handleResize = function () {
            this.charts && this.charts.resize();
        }.bind(this);
    }

    drawCharts(data,deviceInfo) {
        let _baseSettings = _getBaseSettings();
        _baseSettings.series =[
            {
                name:'日均用电量',
                type:'bar',
                barMaxWidth: 40,
                label: {
                    normal: {
                        position: 'top',
                        show: true,
                        textStyle:{
                            color:'#000000'
                        }
                    }
                },
                color:['#52caff'],
                data: data.map(t=>{
                    return t.Power
                 })
            },{
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
                    return t.Temp?t.Temp:20;
                })
            }];
        _baseSettings.title.text= "设备日均用电趋势图";
        _baseSettings.xAxis.data =data.map(d=>{
        
            let t = new Date(d.StatisticsTime),
                time = new Date(deviceInfo.ReformDate);

            let day = t.getDate();
            let month = t.getMonth();
            let year = t.getFullYear();
            let reformDay = time.getDate();
            let reformMonth = time.getMonth();
            let reformYear = time.getFullYear();
            
            if(day==reformDay&&month==reformMonth&&year==reformYear){
                return {
                    value: moment(d.StatisticsTime).format('M月D日')+'\n'+deviceInfo.DeviceNick+'改造日',
                    textStyle:{
                        color:'#fd8888',
                        fontSize: 12
                    }
                };
            }else{
                return moment(d.StatisticsTime).format('M月D日'); 
            }
        });
        _baseSettings.xAxis.name='日';
        /*    data.map(t=>{
            if(t.GroupName){
                return t.GroupName
            }else {
                return t.DeviceNick
            }
        });*/
      /*  _baseSettings.tooltip.formatter = function(a){
            if(a[0]){
                return a[0].name+'<br/>'
                    +'用电量:'+ a[0].data + 'kWh'+'<br/>'
                    + moment(new Date(startTime)).format('YYYY年M月D日')
                    +'～'+moment(new Date(endTime)).format('YYYY年M月D日')
            }
        }*/
        _baseSettings.xAxis.type = 'category';
        /*_baseSettings.yAxis.axisLine.show = false;*/
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(this.refs.chart);
        // 绘制图表
        myChart.setOption(_baseSettings);

        return myChart;
    }
    componentDidMount() {
        const {data,deviceInfo} = this.props;
        this.charts = this.drawCharts(data,deviceInfo);
        window.addEventListener('resize', this._handleResize, false)

    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._handleResize);
        this.charts && this.charts.dispose();
    }

    render() {
        return (
            <div  ref="chart" className="chart">
            </div>
        );
    }
}