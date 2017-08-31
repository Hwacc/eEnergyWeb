/**
 * Created by Hakim on 2017/3/6.
 */
import './style.scss'
import React,{Component} from 'react'
import moment from 'moment'
var echarts = require('echarts-loader');


export default class CavasTable extends Component{
    constructor(){
        super(...arguments)
        this._handleResize = function () {
            this.charts && this.charts.resize();
        }.bind(this);
    }
    getBaseSetting(){
        return{
            tooltip : {
                trigger: 'item',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'line'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            dataZoom:[
                {
                    type: 'slider',
                    yAxisIndex: 1,
                    filterMode: 'filter',
                    zoomLock:true,
                    startValue:0,
                    endValue:5,
                    right:-20,
                    showDetail:false,
                    realtime:false
                }
            ],
            grid:[
                {show:true,x:'0%',y:'0',height:'32',width:'100%',backgroundColor:'#faecd0'},
                {show:true,x:'0%',y:'32',height:'80%',width:'100%'}
            ],
            xAxis : [
                {gridIndex:0, type : 'value', axisLabel:false, min:0, max:1, interval:1, axisTick:false, axisLine:{lineStyle:{color:'#dfdfdf'}}},
                {gridIndex:1, type : 'value', axisLabel:false, min:0, max:1, interval:1, axisTick:false, axisLine:{lineStyle:{color:'#dfdfdf'}}}
                ],
            yAxis : [
                {gridIndex:0,type : 'value', axisLabel:false, min:0, max:1, interval:1, axisTick:false, axisLine:{lineStyle:{color:'#dfdfdf'}}},
                {gridIndex:1,type : 'value', axisLabel:false, min:0, max:1, interval:1, axisTick:false, axisLine:{lineStyle:{color:'#dfdfdf'}}}
                ],
            series :[{
                name:'head',
                type: 'scatter',
                xAxisIndex: 0,
                yAxisIndex: 0,
                data:[
                    [  3.4,    4.5],
                    {
                        name:'qwasdadaasasd',
                        symbolSize:2,
                        value:[1,2],
                        label:{
                            normal:{
                                show:true,
                                textStyle:{
                                    color:'#000'
                                },
                                formatter: '{b}'
                            },
                        },
                        itemStyle:{
                            normal:{
                                color:'#fff'
                            }
                        }
                    },
                    [  4.2,    2.3],
                    [  10.8,   9.5],
                    [  7.2,    8.8]
                ]
            },{
                name:'body',
                type: 'scatter',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data:[
                    [  3.4,    4.5],
                    {
                        name:'qwasdadaasasd',
                        symbolSize:2,
                        value:[1,2],
                        label:{
                            normal:{
                                show:true,
                                textStyle:{
                                    color:'#000'
                                },
                                formatter: '{b}'
                            },
                        },
                        itemStyle:{
                            normal:{
                                color:'#fff'
                            }
                        }
                    },
                    [  4.2,    2.3],
                    [  10.8,   9.5],
                    [  7.2,    8.8]
                ]
            }]
        }
    }
    getArray(data,baseObj){
        let params = data||[]
        let col,row;
        if(params.length>0){
            col = params.length
            row = params[0].length
        }
        let newData = []
        for(let i=col-1;i>=0;i--){
            for(let j=0;j<row;j++){
                let node = Object.assign({},baseObj,{
                    name:params[i][j],
                    value:[j+0.5,col-1-i+0.5]
                })
                newData.push(node)
            }
        }

        return {
            data:newData,
            col : col,
            row : row
        }
    }
    draw(data,head){
        let _baseSettings = this.getBaseSetting()
        let  myChart = echarts.init(this.refs.chart)
        let bodyBaseObj ={
            name:' ',
            symbolSize:[20,10],
            value:[1,2],
            label:{
                normal:{
                    show:true,
                    textStyle:{
                        color:'#000'
                    },
                    formatter: '{b}'
                },
                emphasis:{
                    show:true,
                    textStyle:{
                        fontSize:16,
                        color:'#000'
                    }
                }
            },
            itemStyle:{
                normal:{
                    color:'#fff'
                }
            }
        }
        let headBaseObj = {
            name:' ',
            symbolSize:[20,10],
            value:[1,2],
            label:{
                normal:{
                    show:true,
                    textStyle:{
                        color:'#000'
                    },
                    formatter: '{b}'
                },
                emphasis:{
                    show:true,
                    textStyle:{
                        fontSize:16,
                        color:'#000'
                    }
                }
            },
            itemStyle:{
                normal:{
                    color:'#faecd0'
                }
            }
        }
        let bodyParams = this.getArray(data,bodyBaseObj)
        let headParams = this.getArray([head],headBaseObj)
        _baseSettings.xAxis[0].max = headParams.row
        _baseSettings.yAxis[0].max = headParams.col
        _baseSettings.series[0].data = headParams.data
        _baseSettings.xAxis[1].max = bodyParams.row
        _baseSettings.yAxis[1].max = bodyParams.col
        _baseSettings.series[1].data = bodyParams.data
        _baseSettings.dataZoom[0].startValue = bodyParams.col-5
        _baseSettings.dataZoom[0].endValue = bodyParams.col

        myChart.setOption(_baseSettings)
        return myChart;
    }
    componentDidMount() {
        const {data,head} = this.props;
        this.charts = this.draw(data,head);
        window.addEventListener('resize', this._handleResize, false)
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this._handleResize);
        this.charts && this.charts.dispose();
    }
    onWheelHandler(e){
        let data = this.props.data
        e.stopPropagation()
        let options = this.charts.getOption()
        let startValue = options.dataZoom[0].startValue
        let endValue = options.dataZoom[0].endValue
        let step = endValue - startValue
        let changValue = e.deltaY
        let param = 1
        if(changValue>=1) {
            startValue>0&&this.charts.dispatchAction({
                type: 'dataZoom',
                batch:[{
                    startValue:startValue-param<0?0:startValue-param,
                    endValue:startValue-param<0?step:endValue-param
                }]
            })
        } else {
            changValue<data.length&&this.charts.dispatchAction({
                type: 'dataZoom',
                batch:[{
                    startValue:endValue+param>data.length?data.length-step:startValue+param,
                    endValue:endValue+param>data.length?data.length:endValue+param
                }]
            })
        }



    }

    render(){
        return (
        <div className= "canvas-table">
            <div className="title">{this.props.title}</div>
            <div  ref="chart" className= "table-chart" onWheel={(e)=>this.onWheelHandler(e)}>
            </div>
        </div>
        )
    }
}