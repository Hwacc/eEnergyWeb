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
            text: '用能曲线',
            textAlign: 'left',
            textStyle:{
                fontWeight: 'bolder'
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
            },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: 25,
            containLabel: true
        },

        xAxis: {
            type: 'category',
            data: ['用电总量', '峰电', '谷电'],
            name:'日',
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
                    type: 'dashed'
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
                show:false,
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

export default class TotalChart extends BaseComponent {
    constructor(props){
        super(...arguments);
        this._handleResize = function () {
            this.charts && this.charts.resize();
        }.bind(this);
    }

    /**
     * 多年
     * @param data
     * @param deviceType
     *  @param types
     */
    drawYears(data,deviceType,types,searchType) {
        let _baseSettings = _getBaseSettings();
        let names = data.map((t)=>{
            return t.StatisticTime
        });
       /* if(searchType == staticType.timeBaseOnEnum.multiYear){
            names = data.map((t)=>{
                return moment(t.StatisticTime).format('YYYY');
            });
        }else if(searchType == staticType.timeBaseOnEnum.year){
            names = data.map((t)=>{
                return moment(t.StatisticTime).format('MM');
            });
        }else if(searchType == staticType.timeBaseOnEnum.month){
            names = data.map((t)=>{
                return moment(t.StatisticTime).format('DD');
            });
        }else{
            names = data.map((t)=>{
                return moment(t.StatisticTime).format('HH');
            });
        }*/
         
        _baseSettings.series =[{
            name:'用电量',
            smooth:true,
            type:'line',
            data: data.map((t)=>{
                if(deviceType<0){
                    return {value:t.Total.toFixed(2),name:'总用电量'}
                }else {
                    return {value:t[deviceType].toFixed(2),name:types[deviceType]};
                }
        })
        }];
        
        _baseSettings.title.text=(types[deviceType] == undefined?'全部类型':(types[deviceType]))+ _baseSettings.title.text;
        _baseSettings.xAxis.data = names;
        _baseSettings.xAxis.type = 'category';
        _baseSettings.yAxis.axisLine.show = false;
        if(searchType == 3 ){
            _baseSettings.tooltip.formatter = function (objs) {
                let obj = objs[0];
                return  '<p>'+moment(obj.name).format('YYYY年M月D日 H时')+'</p>'+obj.seriesName+' : '+obj.value+'kWh';
            }
            _baseSettings.xAxis.name = '时'

            _baseSettings.xAxis.axisLabel.formatter = function (xData) {
                return moment(xData).format('HH')
            }
        } else if(searchType == 2){
            _baseSettings.tooltip.formatter = function (objs) {
                let obj = objs[0];
                return  '<p>'+moment(obj.name).format('YYYY年M月D日')+'</p>'+obj.seriesName+' : '+obj.value+'kWh';
            }
            _baseSettings.xAxis.name = '日'
            _baseSettings.xAxis.axisLabel.formatter = function (xData) {
                if(moment(xData).format('D') == 1){
                    let data = moment(xData).format('D')
                    let month = moment(xData).format('MM月')

                    return data + '\n' + month
                } else  {
                    return moment(xData).format('D')
                }
            }
        } else if(searchType == 1){
            _baseSettings.tooltip.formatter = function (objs) {
                let obj = objs[0];
                return  '<p>'+moment(obj.name).format('YYYY年M月')+'</p>'+obj.seriesName+' : '+obj.value+'kWh';
            }
            _baseSettings.xAxis.name = '月'
            _baseSettings.xAxis.axisLabel.formatter = function (xData) {
                if(moment(xData).format('M') == 1){
                    let month = moment(xData).format('M')
                    let year = moment(xData).format('YYYY年')

                    return month + '\n' + year
                } else  {
                    return moment(xData).format('M')
                }
            }
        } else if(searchType == 0){
            _baseSettings.tooltip.formatter = function (objs) {
                let obj = objs[0];
                return  '<p>'+moment(obj.name).format('YYYY年')+'</p>'+obj.seriesName+' : '+obj.value+'kWh';
            }
            _baseSettings.xAxis.name = '年'
            _baseSettings.xAxis.axisLabel.formatter = function (xData) {
                return moment(xData).format('YYYY')
            }
        }
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(this.refs.chart);
        // 绘制图表
        myChart.setOption(_baseSettings);
        return myChart;
    }


    componentDidMount() {
        const {data,type,types,searchType} = this.props;
        this.charts = this.drawYears(data,type,types,searchType);
        window.addEventListener('resize', this._handleResize, false)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._handleResize);
        this.charts && this.charts.dispose();
    }

    render() {
        return (
            <div  ref="chart" className="chart" style={{height:'100%',width:'100%'}}>
            </div>
        );
    }
}