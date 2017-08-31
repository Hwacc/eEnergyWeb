/**
 * Created by whj57 on 2016/12/1.
 */
import React,{Component} from 'react'
var echarts = require('echarts-loader');
import BaseComponent from 'basecomponent'



function _getBaseSettings() {
    return {
        color: ['#52caff', '#ffd271'],
        title:{
            text: '用电排行',
            textAlign: 'left',
            textStyle:{
                fontWeight: 'bolder'
            }
        },

        textStyle: {
            fontFamily: 'Helvetica Neue, Helvetica, Arial, PingFang SC, Hiragino Sans GB, WenQuanYi Micro Hei, Microsoft Yahei, sans-serif',
            fontSize:'18px'
        },
        xAxis: {
            type: 'value',
            data: ['用电总量', '峰电', '谷电'],
            splitLine: {
                show: false
            },
            axisLabel: {
                show: false,
                textStyle: {
                    fontSize: 14
                }
            },
            axisLine: {
                show: false,
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
            type: 'category',
            splitLine: {
                show: false,
                lineStyle: {
                    //type: 'dashed'
                }
            },
            axisLabel: {
                textStyle: {
                    fontSize: 18,
                    color:'#6d6d6d'
                },
            },
            axisLine: {
                show: false,
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

    };
}

export default class AreaCharts extends BaseComponent {
    constructor(props){
        super(...arguments);
        this._handleResize = function () {
            this.charts && this.charts.resize();
        }.bind(this);

    }

    draw(data,title) {
        let handleData;
        if(data.length > 5){
           handleData = data.slice(0,[5]);
        }else{
            handleData = data;
        }
        let _baseSettings = _getBaseSettings();
        let color =['#fd8888','#ffa56e', '#ffd271', '#f7ec52', '#defa61','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3']
        let  myChart = echarts.init(this.refs.chart)
        _baseSettings.series = [{
            type:'bar',
            barWidth: 1,
            label: {
                    normal: {
                        position:['0%','120%'],
                        show: true,
                        textStyle:{
                            color:'#86868a',
                            fontSize: 12,
                        },
                        formatter: function (obj) {
                            return obj.data.name+' '+':'+' '+obj.data.value
                        }
                    }
                },
            data: handleData&&handleData.map((t,i)=>{
                    return {
                        name: t.GroupName,
                        value:t.TotalEle.toFixed(2),
                        itemStyle:{
                            normal:{
                                color: color[i]
                            }
                        }
                    };


            })
        }];

            _baseSettings.title.text=title+ _baseSettings.title.text;

        _baseSettings.yAxis.data = handleData.map((t,i)=>{return i+1});
        _baseSettings.xAxis.type = 'value';
        _baseSettings.yAxis.axisLine.show = false;
        _baseSettings.yAxis.splitLine.show = false;
        _baseSettings.xAxis.axisLine.show = false;
        _baseSettings.yAxis.inverse = true;

        // 基于准备好的dom，初始化echarts实例
        // 绘制图表
        myChart.setOption(_baseSettings);
        return myChart;

        }

    componentDidMount() {
        const {data,title} = this.props;
        this.charts = this.draw(data,title);
        window.addEventListener('resize', this._handleResize, false)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._handleResize);
        this.charts && this.charts.dispose();
    }

    render() {
        return (

                <div  ref="chart" className= "chart">
                </div>
        );
    }
}