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
        color: ['#52caff', '#ffd271'],
        title:{
            text: '用能柱状图',
            textAlign: 'left',
            textStyle:{
                fontWeight: 'bolder',
                fontSize:16
            }
        },
        textStyle: {
            fontFamily: 'Helvetica Neue, Helvetica, Arial, PingFang SC, Hiragino Sans GB, WenQuanYi Micro Hei, Microsoft Yahei, sans-serif',
            fontSize:'18px'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                animation: false,
                type: 'shadow'
            }
        },
        visualMap: {
            show: false,
            min:0,
            max:10,
            dimension:0,
            inRange: {
                color: ['#52caff','#fd8888']
            }
        },
        grid: {
            left: '2%',
            right: '3%',
            bottom: '0',
            containLabel: true
        },

        xAxis: {
            type: 'category',
            data: ['用电总量', '峰电', '谷电'],
            splitLine: {
                show: false
            },
            axisLabel: {
                tooltip: true,
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
        yAxis: {
            type: 'value',
            name: 'kWh',
            splitLine: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    fontSize: 14
                }
            },
            axisLine: {
                show:true,
                lineStyle: {
                    color:'#aaa'
                }
            },
            
            axisTick: {
               show:false 
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

export default class AllTypeCharts extends BaseComponent {
    constructor(props){
        super(...arguments);
        this._handleResize = function () {
            this.charts && this.charts.resize();
        }.bind(this);
    }

    drawCharts(data,useTypes,name,searchType) {
        let chartData = [];
        for(var key in useTypes){
            let total = 0;
            data.map(i=>{
                total = total+ i[key];
            });
            let name = useTypes[key];
            chartData.push({name:name,value:total.toFixed(2)});
        }
        let _baseSettings = _getBaseSettings();
        _baseSettings.series =[{
            name:'用电量',
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
            data:chartData.map(t=>{
                 return t.value  
                })
           
        }];
        
        _baseSettings.title.text= name + _baseSettings.title.text;
        _baseSettings.xAxis.data = chartData.map(t=>{
            return t.name
        });
        _baseSettings.xAxis.axisLabel.formatter = (params)=>{
            return echarts.format.truncateText(params, 50, '…');
        };
        if(searchType == 3){
            _baseSettings.tooltip.formatter = function(a){
                if(a[0]){
                    return a[0].name+'<br/>'
                        +'用电量:'+ a[0].data + 'kWh'+'<br/>'
                        + moment(data[0].StatisticTime).format('YYYY年M月D日 H时')
                        +'～'+moment(data[data.length-1].StatisticTime).format('YYYY年M月D日 H时')
                }
            }
        }else if(searchType == 2){
            _baseSettings.tooltip.formatter = function(a){
                if(a[0]){
                    return a[0].name+'<br/>'
                        +'用电量:'+ a[0].data + 'kWh'+'<br/>'
                        + moment(data[0].StatisticTime).format('YYYY年M月D日')
                        +'～'+moment(data[data.length-1].StatisticTime).format('YYYY年M月D日')
                }
            }
        }else if(searchType == 1){
            _baseSettings.tooltip.formatter = function(a){
                if(a[0]){
                    return a[0].name+'<br/>'
                        +'用电量:'+ a[0].data + 'kWh'+'<br/>'
                        + moment(data[0].StatisticTime).format('YYYY年M月')
                        +'～'+moment(data[data.length-1].StatisticTime).format('YYYY年M月')
                }
            }
        }else{
            _baseSettings.tooltip.formatter = function(a){
                if(a[0]){
                    return a[0].name+'<br/>'
                        +'用电量:'+ a[0].data + 'kWh'+'<br/>'
                        + moment(data[0].StatisticTime).format('YYYY年')
                        +'～'+moment(data[data.length-1].StatisticTime).format('YYYY年')
                }
            }
        };
        _baseSettings.xAxis.type = 'category';
        _baseSettings.yAxis.axisLine.show = true;
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(this.refs.chart);
        // 绘制图表
        myChart.setOption(_baseSettings);
        myChart.on('click', (params) =>{
            this.props.chartsClick(params.name)
        });
        myChart.on('mouseover',(params)=>{
            
        });
        return myChart;
    }
    componentDidMount() {
        const {data,useTypes,name,searchType} = this.props;
        this.charts = this.drawCharts(data,useTypes,name,searchType);
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