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
            left: '3%',
            right: '4%',
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
                    color: '#aaa'  
                }
            },
            axisTick: {
                show: false
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

export default class AllAreaCharts extends BaseComponent {
    constructor(props){
        super(...arguments);
        this._handleResize = function () {
            this.charts && this.charts.resize();
        }.bind(this);
    }

    drawCharts(data,name,startTime,endTime) {
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
            itemStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{//坐标轴线的颜色
                        offset: 0, color: '#52caff' // 0% 处的颜色
                    }, {
                        offset: 1, color: '#fd8888' // 100% 处的颜色
                    }])
                }
            },
            data: data.map(t=>{
                if(t.TotalEle || t.TotalEle == 0){
                    return (t.TotalEle).toFixed(2);
                }else {
                    return (t.Power).toFixed(2);

                }
            }),
           
        }];
        _baseSettings.title.text= name + _baseSettings.title.text;
        _baseSettings.xAxis.data = data.map(t=>{
            if(t.GroupName){
                return t.GroupName
            }else {
                return t.DeviceNick
            }
        });
        _baseSettings.tooltip.formatter = function(a){
            if(a[0]){
                return a[0].name+'<br/>'
                    +'用电量:'+ a[0].data + 'kWh'+'<br/>'
                    + moment(startTime).format('YYYY年M月D日')
                    +'～'+moment(endTime).format('YYYY年M月D日')
            }
        }
        _baseSettings.xAxis.axisLabel.formatter = (params)=>{
            return echarts.format.truncateText(params, 70, '…');
        };
        _baseSettings.xAxis.type = 'category';
        /*_baseSettings.yAxis.axisLine.show = false;*/
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(this.refs.chart);
        // 绘制图表
        myChart.setOption(_baseSettings);
        myChart.on('mouseover',(params)=>{
            let index = params.dataIndex;
        });
        return myChart;
    }
    componentDidMount() {
        const {data,name,time} = this.props;
        if(time){
            let year = time.getFullYear(),
                month = time.getMonth(),
                day = time.getDate(),
                startTime = moment(new Date(year,month,1)).format('YYYY/MM/DD HH:mm:ss'),
                endTime = moment(new Date(year,month,1)).add(1,'month').add(-1,'second').format('YYYY/MM/DD HH:mm:ss')
            this.charts = this.drawCharts(data,name,startTime,endTime);
            window.addEventListener('resize', this._handleResize, false)
        }
        
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