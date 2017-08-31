
import React,{Component} from 'react'
import moment from 'moment'






var echarts = require('echarts-loader');
function _getBaseSettings() {
    return {
        color: ['#52caff', '#ffd271'],
        backgroundColor: '#fff',
        textStyle: {
            fontFamily: 'Helvetica Neue, Helvetica, Arial, PingFang SC, Hiragino Sans GB, WenQuanYi Micro Hei, Microsoft Yahei, sans-serif',
            fontSize:'18px',
        },
        title: {
            text: '节能足迹',
            textStyle: {
                color:'#434343',
                fontSize: 18,
                fontWeight: 'bold',
                fontStyle: 'normal',
                fontFamily: 'Helvetica Neue, Helvetica, Arial, PingFang SC, Hiragino Sans GB, WenQuanYi Micro Hei, Microsoft Yahei, sans-serif'

            },
            left: 'center',
            top:20,
        },
        legend: {
            data: ['节省电费', '节省量'],
            bottom: 5,
            left:'center'
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
                console.log(obj)
                    if(obj[0].name){
                        return  obj[0].name +'<br />'+
                            '<span style=" display: inline-block;' +
                            'margin-right: 5px;' +
                            'border-radius: 10px;width: 9px;' +
                            'height: 9px;background-color: ' + obj[0].color + '"></span>'+'用电量' +'：'+obj[0].value 
                    }
                }
        },
        grid: [
            {
                x: '7%',
                y: '20%', 
                width: '85%',
                height: '30%'
            },
            {
                x: '7%',
                y2: '20%',
                width: '85%',
                height: '30%'
            }
        ],
        xAxis: [
            {
                gridIndex: 0,
                type: 'category',
                data: [],
                splitLine: {
                    show: false,
                },
                axisLabel: {
                    show: false,
                    textStyle: {
                        fontSize: 14
                    },
                  
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
            {
                gridIndex: 1,
                type: 'category',
                position:'bottom',
                data: [],
                splitLine: {
                },
                axisLabel: {
                    show:true,
                    margin:18,
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
                    show:false,
                    lineStyle: {
                        color: '#aaa'
                    }
                }
            },
        ],
        yAxis: [
            {
                gridIndex: 0,
                type: 'value',
                name: '元',
                nameGap: 8,
                splitLine: {
                    show:false,
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
                    inside: true,
                    alignWithLabel: true,
                    lineStyle: {
                        color: '#aaa'
                    }
                }
            },
            {  
                gridIndex: 1,
                type: 'value',
                inverse:true,
                name: 'kWh',
                nameGap: 8,
                splitLine: {
                    show:false,
                    lineStyle: {
                        //type: 'dashed'
                    }
                },
                axisLabel: {
                    textStyle: {
                        fontSize: 14
                    },
                },
                axisLine: {
                    lineStyle: {
                        color: '#aaa'
                    }
                },
                axisTick: {
                    inside: true,
                    alignWithLabel: true,
                    lineStyle: {
                        color: '#aaa'
                    }
                }
            },
           
        ],
        
        series: [
            {
                name: 'I',
                type: 'bar',
                xAxisIndex: 0,
                yAxisIndex: 0,
                data: []
            },
            {
                name: 'II',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: []
            },
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
    
    drawChart(data) {
        let _baseSettings = _getBaseSettings();
        _baseSettings.series =[{
            name:'节省电费',
            type:'bar',
            barWidth:'30%',
            xAxisIndex: 0,
            yAxisIndex: 0,
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
            itemStyle: {
                normal: {
                    color: '#ffd271',
                }
            },
            data:data.map(d=>{
                return ((d.TotalEle)*0.5).toFixed(2)
            })
        },{
            name:'节省量',
            type:'bar',
            barWidth:'30%',
            xAxisIndex: 1,
            yAxisIndex: 1,
            barCategoryGap: 25,
            label: {
                normal: {
                    position: 'bottom',
                    show: true,
                    textStyle: {
                        fontSize: 12,
                        color: '#000000'
                    }
                }
            },
            itemStyle: {
                normal: {
                    color: '#52caff',
                }
            },
            data:data.map(d=>{
                return d.TotalEle
            })
            
        }];
        _baseSettings.xAxis[0].data = data.map(d=>{
            return d.StatisticTime
        });
        _baseSettings.xAxis[1].data = data.map(d=>{
            return d.StatisticTime
        });
        _baseSettings.tooltip.formatter = function (objs) {
            let obj = objs[0];
            let index  = obj.dataIndex;
            return  '<p>'+moment(obj.name).format('YYYY年M月D日')+'</p>'+'<p>'+'节省量:'+(data[index]['TotalEle']).toFixed(2)+'kWh'+'</p>'
                +'<p>'+'节省量:'+(data[index]['TotalEle']*0.5).toFixed(2)+'元'+'</p>';
        }
        _baseSettings.xAxis[1].axisLabel.formatter = (xData) =>{
            return moment(xData).format('M.D')
        };
        var myChart = echarts.init(this.refs.chart);
        myChart.setOption(_baseSettings);
        return myChart;
    }

    componentDidMount() {
        const {data} = this.props;
        this.charts = this.drawChart(data);
        window.addEventListener('resize', this._handleResize, false)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._handleResize);
        this.charts && this.charts.dispose();
    }
    render() {
        return (
            <div  ref="chart" style={{height:'100%',width:'100%'}}></div>
        )
    }
}