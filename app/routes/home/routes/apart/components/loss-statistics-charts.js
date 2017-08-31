/**
 * Created by whj57 on 2016/12/1.
 */
import React,{Component} from 'react'
import * as staticType from 'utils/staticType'
var echarts = require('echarts-loader');
function _getBaseSettings(){
    return {
        color:['#fd8888','#52caff','#ffd271','transparent'],
        title:{
            show:true,
            text:'分项用能占比',
            x:'left',
            top:"0",
            textStyle:{
                fontWeight: 'bolder',
                fontFamily: 'Helvetica Neue, Helvetica, Arial, PingFang SC, Hiragino Sans GB, WenQuanYi Micro Hei, Microsoft Yahei, sans-serif'
            }
        },
        text: '饼图',
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c}kWh({d}%)"
        },
        legend: {
            orient: 'vertical',
            data: [],
            right:'10%',
            top:'30%',
            width:"100%",
            align:'left',
            formatter: '{name}',
            itemGap:20,
            textStyle:{
                fontSize:14
            }
        },
        series: [
            {
                name: '用电信息',
                type: 'pie',
                avoidLabelOverlap: true,
                center:['40%','55%'],
                radius:["30%",'60%'],
                label: {
                    normal: {
                        show: true,
                        position: 'outside',
                        formatter:" {d}% ",
                        textStyle:{
                            fontSize:'16'
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
    _Setting(data,useTypes){
        let chartData = [];
        let legendData = []
        for(var key in useTypes){
            let total = 0;
            data.map(i=>{
                total = total+ i[key];
            });
            let name = useTypes[key];
            chartData.push({name:name,value:total.toFixed(2)});
            legendData.push(name)
        }
        let setting = _getBaseSettings();
        setting.series[0].data = chartData;


        setting.legend.data  = legendData;
        var myChart = echarts.init(this.refs.chart);
        myChart.setOption(setting);
        return myChart;
    }
    componentDidMount() {
        const {data,useTypes} = this.props;
        this.charts = this._Setting(data,useTypes);
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