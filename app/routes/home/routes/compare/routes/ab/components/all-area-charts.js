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
            color:['#ffc571','#f9e277','#e9f080','#8ee1e2','#52caff','#60a7f0','#7b87d6','#fea073'],
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
            },
            legend: {
                data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎', '百度', '谷歌', '必应', '其他'],
                right: 0,
                top: 0,
                orient: 'vertical',
                itemHeight:10,
                itemWidth: 10,
                itemGap:0,
                textStyle: {
                    fontSize: 8
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                containLabel: true

            },
            dataZoom:[{
                type: 'inside',
                xAxisIndex: 0,
                filterMode: 'filter',
                startValue:0,
                endValue:1,
                zoomLock:true,
            }],
            xAxis: [
                {
                    type: 'category',
                    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                    axisLine: {
                        show:true,
                        lineStyle: {
                            color: '#aaa'
                        }
                    },
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        show:true,
                        textStyle: {
                            fontSize: 14
                        }
                    },
                    axisLine: {
                        show:true,
                        lineStyle: {
                            color: '#aaa'
                        }
                    },
                    axisTick: {
                        show: false
                    }
                }],
            series: [
                {
                    name: '直接访问',
                    type: 'bar',
                    data: [320, 332, 301, 334, 390, 330, 320]
                },
                {
                    name: '邮件营销',
                    type: 'bar',
                    stack: '广告',
                    data: [120, 132, 101, 134, 90, 230, 210]
                },
                {
                    name: '联盟广告',
                    type: 'bar',
                    stack: '广告',
                    data: [220, 182, 191, 234, 290, 330, 310]
                },
                {
                    name: '视频广告',
                    type: 'bar',
                    stack: '广告',
                    data: [150, 232, 201, 154, 190, 330, 410]
                },
                {
                    name: '搜索引擎',
                    type: 'bar',
                    data: [862, 1018, 964, 1026, 1679, 1600, 1570],
                    markLine: {
                        lineStyle: {
                            normal: {
                                type: 'dashed'
                            }
                        },
                        data: [
                            [{type: 'min'}, {type: 'max'}]
                        ]
                    }
                },
                {
                    name: '百度',
                    type: 'bar',
                    barWidth: 5,
                    stack: '搜索引擎',
                    data: [620, 732, 701, 734, 1090, 1130, 1120]
                },
                {
                    name: '谷歌',
                    type: 'bar',
                    stack: '搜索引擎',
                    data: [120, 132, 101, 134, 290, 230, 220]
                },
                {
                    name: '必应',
                    type: 'bar',
                    stack: '搜索引擎',
                    data: [60, 72, 71, 74, 190, 130, 110]
                },
                {
                    name: '其他',
                    type: 'bar',
                    stack: '搜索引擎',
                    data: [62, 82, 91, 84, 109, 110, 120]
                }
            ]
    };
}

export default class AllAreaCharts extends BaseComponent {
    constructor(props){
        super(...arguments);
        this._handleResize = function () {
            this.charts && this.charts.resize();
        }.bind(this);
    }

    drawCharts(data,title) {
        let _baseSettings = _getBaseSettings();
        let names = [],
            series = []
        if(data[0]){
            data[0].DeviceEnergyMaps.map(d=>{
                names.push(d.DeviceId+'')
            })

        }
        _baseSettings.legend.formatter = function(name){
            if(data[0]){
                let sign = 0
                data[0].DeviceEnergyMaps.some((d,i)=>{

                    if(name == d.DeviceId){
                        sign = i
                        return true
                    }
                    return false
                })
                return data[0].DeviceEnergyMaps[sign].DeviceNick
            }
            return name
        }

        _baseSettings.legend.data = names

        _baseSettings.xAxis[0].data = data.map(d => moment(d.StatisticsTime).format('YYYY年M月D日'))


        let deviceNum = 0
        if(data.length>0){
            deviceNum = data[0].DeviceEnergyMaps.length
        }
        for(let i = 0;i<deviceNum;i++){
            let baseObj = {
                name:data[0].DeviceEnergyMaps[i].DeviceId,
                type:'bar',
                data :[],
                barMinHeight:'1',
                label:{
                    normal:{
                        show:true,
                        position:'top',
                        textStyle:{
                            color:'#000'
                        }
                    }
                }
            }
            data.map(d=>{
                baseObj.data.push(d.DeviceEnergyMaps[i].Power)
            })
            series.push(baseObj)
        }
        _baseSettings.series = series
        /*_baseSettings.yAxis.axisLine.show = false;*/
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(this.refs.chart);

        // 绘制图表
        myChart.setOption(_baseSettings);
        return myChart;
    }
    componentDidMount() {
        let {data, title} = this.props
        this.charts = this.drawCharts(data||[],title);
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
