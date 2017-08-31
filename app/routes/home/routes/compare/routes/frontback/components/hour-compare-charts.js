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
            text: '',
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
   
        grid: {
            top: '30',
            left: '20',
            right: '20',
            bottom: 0,
            containLabel: true
       
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
                show: true
            },
            axisLabel: {
                show:true,
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
        }]
    }
    
}

export default class HourCompareCharts extends BaseComponent {
    constructor(props){
        super(...arguments);
        this._handleResize = function () {
            this.charts && this.charts.resize();
        }.bind(this);
    }

    drawCharts(data) {
     
        let _baseSettings = _getBaseSettings();
        _baseSettings.series =[{
                name:'每小时用电量',
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
                data: data.map((t,i)=>{
                    if(i ==0){
                        return {
                            value: t,
                            itemStyle:{
                                normal:{color:'#fd8888'}
                            }
                        }
                    }else{
                        return {
                            value: t,
                            itemStyle:{
                                normal:{color:'#52caff'}
                            }
                        }
                    }
                   
                })
            }];
      /*  _baseSettings.title.text= "改造前后每小时用电对比";*/
        _baseSettings.xAxis.data =['改造前','改造后']
        _baseSettings.xAxis.type = 'category';
        /*_baseSettings.yAxis.axisLine.show = false;*/
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(this.refs.chart);
        // 绘制图表
        myChart.setOption(_baseSettings);
        return myChart;
    }
    componentDidMount() {
        const {data} = this.props;
        this.charts = this.drawCharts(data);
        window.addEventListener('resize', this._handleResize, false)
    }

 
    componentWillUnmount() {
        window.removeEventListener('resize', this._handleResize);
        this.charts && this.charts.dispose();
    }

    render() {
        return (
            <div  ref="chart" style={{position:'relative',width:'100%',height:'95%'}}>
                
            </div>
        );
    }
}