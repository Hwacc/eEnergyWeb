/**
 * Created by whj57 on 2016/10/26.
 */
import './style.scss'
import React from 'react'
import classNames from 'classnames'
import BaseComponent from '../basecomponent'
import timeicon from './time_icon.png'

class TimeFullInput extends BaseComponent{
    timeChangeHandler(hour,minute,second){
        var hourInt = parseInt(hour),
            minuteInt = parseInt(minute),
            secondInt = parseInt(second),
            initHourResult = hourInt,
            initMinuteResult = minuteInt,
            initSecondResult = secondInt;
        if(hourInt) {
            if (hourInt > 0 && hourInt < 23) {
                initHourResult = hourInt;
            }else {
                initHourResult=23
            }
            console.log(initHourResult)
        }
        if(minuteInt){
            if(minuteInt>0&&minuteInt<60){
                initMinuteResult = minuteInt;
            }else {
                initMinuteResult = 59
            }
            console.log(initMinuteResult);
            console.log(parseInt(0))
        }
        if(secondInt){
            if(secondInt>0&&secondInt<60){
                initSecondResult = secondInt;
            }else {
                initSecondResult = 59;
            }
            console.log(initSecondResult)
        }
        
        if(initHourResult==24&&initMinuteResult>0&&initSecondResult>0){
            initSecondResult = [0,0];
            initMinuteResult = [0,0];
            initHourResult = [2,4]
        }else {
            initMinuteResult=initMinuteResult.toString().split('');
            if(initMinuteResult.length<2){
                initMinuteResult = ['0'].concat(initMinuteResult)
            }
            initSecondResult=initSecondResult.toString().split('');
            if(initSecondResult.length<2){
                initSecondResult = ['0'].concat(initSecondResult)
            }
            initHourResult = initHourResult.toString().split('');
            if(initHourResult.length<2){
                initHourResult = ['0'].concat(initHourResult)
            }
        }
        this.props.valChange(initHourResult.join('')+':'+initMinuteResult.join('')+':'+initSecondResult.join(''))
    };
   
   
    
    render(){
        const {val,className} = this.props;
        let vals = val.split(':');
        console.log(vals)
        let selfName = classNames(className,'sem-input');
        return(
            <div className={selfName}>
                <div className="time-block">
                    <input value={vals[0]} type="text" onChange={(e)=>{this.timeChangeHandler(e.target.value,vals[1],vals[2])}}/>
                    <span>:</span>
                    <input value={vals[1]} type="'text" onChange={(e)=>{this.timeChangeHandler(vals[0],e.target.value,vals[2])}}/>
                    <span>:</span>
                    <input value={vals[2]} type="'text" onChange={(e)=>{this.timeChangeHandler(vals[0],vals[1],e.target.value)}}/>
                </div>
                <img src={timeicon}/>
            </div>
        )
    }
}
export default TimeFullInput