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
            formatter:function(a){
                if(a[0]){
                    return moment(a[0].name).format('YYYY年M月D日')+'<br/>'
                        +'用电量:'+ a[0].value + 'kWh'
                }
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '0',
            containLabel: true
        },
      
        xAxis: {
            type: 'category',
            name:'日',
            data: ['用电总量', '峰电', '谷电'],
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
                show: false,
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
     */
    drawYears(data,title,searchType) {
        let _baseSettings = _getBaseSettings();
        _baseSettings.series =[{
            name:'用电量',
            smooth:true,
            type:'line',
            data: data.map((t)=>{
                    return {value:t.TotalEle.toFixed(2),name:'总用电量'}
            })
        }];
        _baseSettings.title.text=title+ _baseSettings.title.text;
        _baseSettings.xAxis.data = data.map((t)=>{
            return t.StatisticTime;
        });
        _baseSettings.xAxis.type = 'category';
        _baseSettings.yAxis.axisLine.show = false;
        if(searchType == 3 ){
            _baseSettings.tooltip.formatter = function (objs) {
                let obj = objs[0];
                return  '<p>'+moment(obj.name).format('YYYY年M月D日 H时')+'</p>'+obj.seriesName+' : '+obj.value+'kWh';
            }
            _baseSettings.xAxis.name = '时'
            _baseSettings.xAxis.axisLabel.formatter = function (xData) {
                return moment(xData).format('H')
            }
        } else if(searchType == 2){
            _baseSettings.tooltip.formatter = function (objs) {
                let obj = objs[0];
                return  '<p>'+moment(obj.name).format('YYYY年M月D日')+'</p>'+obj.seriesName+' : '+obj.value+'kWh';
            }
            _baseSettings.xAxis.name = '日'
            _baseSettings.xAxis.axisLabel.formatter = function (xData) {
                if(moment().format('D') == '1'){
                    let data = moment(xData).format('D')
                    let month = moment(xData).format('M月')

                    return data + '\n' + month
                } else  {
                    return moment(xData).format('D')
                }
            }
            _baseSettings.xAxis.axisLabel.interval = function (index, data) {
                if(moment(data).format('D') == '1'){
                    return true
                }
                if(index%2 == 0){
                    return true
                }else {
                    return false
                }

            }
        } else if(searchType == 1){
            _baseSettings.tooltip.formatter = function (objs) {
                let obj = objs[0];
                return  '<p>'+moment(obj.name).format('YYYY年M月')+'</p>'+obj.seriesName+' : '+obj.value+'kWh';
            }
            _baseSettings.xAxis.name = '月'
            _baseSettings.xAxis.axisLabel.formatter = function (xData) {
                if(moment(xData).format('M') == '1'){
                    let month = moment(xData).format('M')
                    let year = moment(xData).format('YYYY年')

                    return month + '\n' + year
                } else  {
                    return moment(xData).format('M')
                }
            }
            _baseSettings.xAxis.axisLabel.interval = function (index, data) {
                if(moment(data).format('M') == '1'){
                    return true
                }
                if(index%2 == 0){
                    return true
                }else {
                    return false
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
        const {data,title,searchType} = this.props;
        this.charts = this.drawYears(data,title,searchType);
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