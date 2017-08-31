/**
 * Created by whj57 on 2016/12/1.
 */
import React,{Component} from 'react'

var echarts = require('echarts-loader');
function _getBaseSettings(){
    return {
        color:['#ffc571','#f9e277','#e9f080','#8ee1e2','#52caff','#60a7f0','#7b87d6','#fea073'],
        title:{
            show:true,
            text:'耗电统计',
            x:'center',
            top:"0",
            textStyle:{
                color:'#434343',
                fontSize:18,
                fontWeight: 'bold',
                fontFamily: 'Helvetica Neue, Helvetica, Arial, PingFang SC, Hiragino Sans GB, WenQuanYi Micro Hei, Microsoft Yahei, sans-serif'
            }
        },
        text: '饼图',
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c}kWh({d}%)"
        },
        legend: {
            orient: 'horizontal',
            data: [],
            right:'0',
            bottom:'0',
            width:"100%",
            align:'left',
            itemHeight: 10,
            itemWidth: 10,
            tooltip: {
                show: true
            },
            itemGap:10,
            textStyle:{
                fontSize:12
            }
        },
        series: [
            {
                name: '用电信息',
                type: 'pie',
                avoidLabelOverlap: true,
                center:['50%','50%'],
                radius:["35%",'60%'],
                startAngle:90,
                label: {
                    normal: {
                        show: true,
                        position: 'outside',
                        formatter:" {d}% ",
                        textStyle:{
                            fontSize:'14'
                        }
                    },
                    emphasis: {
                        show: true,
                        position:'outside',
                        textStyle: {
                            fontSize: '20',
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: true
                    }
                }
            },
        ]
    }
}


export default class extends Component {
    constructor(props) {
        super(...arguments);
        this._handleResize = function () {
            this.charts && this.charts.resize();
        }.bind(this);
    }
    _Setting(data){
        let setting = _getBaseSettings();
        let chartData = [];
        let legendData = data.map(item=>{
            let obj = {
                name:item.GroupName,
                value:item.TotalEle?item.TotalEle.toFixed(2):0.00
            };
            chartData.push(obj);
            return obj.name
        });
        setting.series[0].data = chartData;
        setting.legend.data  = legendData;
        setting.legend.formatter = function (name) {
           /* let names ='';
            chartData&&chartData.map(t=>{
                if(name == t.name){
                     names =  name +' '+ t.value;
                }
            });*/
            return echarts.format.truncateText(name, 50, '…');
        };
        var myChart = echarts.init(this.refs.chart);
        myChart.setOption(setting);
        return myChart;
    }

    componentDidMount() {
        const {data} = this.props;
        this.charts = this._Setting(data);
        window.addEventListener('resize', this._handleResize, false)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._handleResize);
        this.charts && this.charts.dispose();
    }

    render() {
        return (
            <div  ref="chart" style={{height:'100%',width:'100%'}}>
            </div>
        );
    }
}