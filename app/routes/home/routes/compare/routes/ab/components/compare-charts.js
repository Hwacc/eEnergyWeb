/**
 * Created by whj57 on 2016/12/1.
 */
import React,{Component} from 'react'
var echarts = require('echarts-loader');
function _getBaseSettings() {
    return {
        color: ['#52caff', '#ffd271'],
        backgroundColor: '#fff',
        textStyle: {
            fontFamily: 'Helvetica Neue, Helvetica, Arial, PingFang SC, Hiragino Sans GB, WenQuanYi Micro Hei, Microsoft Yahei, sans-serif',
            fontSize:'18px',

        },

        tooltip: {
           /* trigger: 'item',
            formatter: "{b} <br/>用电量: {c}kWh"*/
            trigger: 'axis',
            axisPointer: {
                animation: false,
                type: 'shadow'
            },
            formatter: function(obj){
                    if(obj[0].name){
                        return  obj[0].name +'<br />'+
                            '<span style=" display: inline-block;' +
                            'margin-right: 5px;' +
                            'border-radius: 10px;width: 9px;' +
                            'height: 9px;background-color: ' + obj[0].color + '"></span>'+'用电量' +'：'+obj[0].value
                    }
                }


        },

        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top:'10%',
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
                lineStyle: {
                    color: '#aaa'
                }
            }
        },
        yAxis: {
            type: 'value',
            name: '',
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
     * 多年
     * @param data
     */

    drawYears(data) {
        let _baseSettings = _getBaseSettings();
        let names = data.map(d=>d.DeviceNick);
        let series = []
        let obj = {
            type:'bar',
            barWidth:'30%',
            data:[],
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
        let colors = ['#fd8888','#ffd271','#52caff']
        data.map((d,n)=>{
            let baseObj = {
                value:d.HourAvePower.toFixed(2),
                itemStyle:{
                    normal:{color:colors[n%3]}
                }
            }
           obj.data.push(baseObj)

        })
        series.push(obj)
        _baseSettings.series=series
/*        _baseSettings.series =[{
            type:'bar',
            barWidth:'30%',
            barCategoryGap: 25,
            label: {
                normal: {
                    position: 'top',
                    show: true,
                    textStyle: {
                        fontSize: 12,
                        color: '#000000'
                    }
                }
            },

            data:data.map((item,index)=>{
                if(index==0 || index==3){
                    return {
                        name:names[index],
                        value:(item).toFixed(2),
                        itemStyle:{
                            normal:{color:'#fd8888'}
                        }
                    }

                }else if(index==2){
                    return{
                        label: {
                            normal: {
                                position: 'top',
                                show: false,
                                textStyle: {
                                    fontSize: 12,
                                    color: '#000000'
                                }
                            }
                        },
                    }
                } else {
                    return {
                        name:names[index],
                        value:(item).toFixed(2),
                        itemStyle:{
                            normal:{color:'#ffd271'}
                        }
                    }
                }
            })
        }];*/

        _baseSettings.xAxis.data = names;
        _baseSettings.xAxis.type = 'category';
        _baseSettings.xAxis.axisTick.show = false;
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(this.refs.chart);
        // 绘制图表
        myChart.setOption(_baseSettings);
        return myChart;
    }


    componentDidMount() {
        const {data} = this.props;
        this.charts = this.drawYears(data||[]);
        window.addEventListener('resize', this._handleResize, false)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._handleResize);
        this.charts && this.charts.dispose();
    }

    render() {
        return (
            <div  ref="chart" style={{height:'80%',width:'100%',position:'relative',top:'20%'}}>
            </div>
        );
    }
}
