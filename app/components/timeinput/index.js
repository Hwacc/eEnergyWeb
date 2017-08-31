/**
 * Created by whj57 on 2016/10/26.
 */
import './style.scss'
import React from 'react'
import classNames from 'classnames'
import BaseComponent from '../basecomponent'
import timeicon from './time_icon.png'
class TimeInput extends BaseComponent{
    timeChangeHandler(hour,minute){
        var hourInt = parseInt(hour),
            minuteInt = parseInt(minute),
            initHourResult = hourInt?hourInt:0,
            initMinuteResult = minuteInt?minuteInt:0;
        if(hourInt) {
            if (hourInt > 0 && hourInt < 23) {
                initHourResult = hourInt;
            }else {
                initHourResult=23
            }
        }
        if(minuteInt){
            if(minuteInt>0&&minuteInt<60){
                initMinuteResult = minuteInt;
            }else {
                initMinuteResult = 59
            }
        }
        if(initHourResult==24&&initMinuteResult>0){
            initMinuteResult = [0,0];
            initHourResult = [2,4]
        }else {
            initMinuteResult=initMinuteResult.toString().split('');
            if(initMinuteResult.length<2){
                initMinuteResult = ['0'].concat(initMinuteResult)
            }
            initHourResult = initHourResult.toString().split('');
            if(initHourResult.length<2){
                initHourResult = ['0'].concat(initHourResult)
            }
        }
        this.props.valChange(initHourResult.join('')+':'+initMinuteResult.join(''))
    };
    render(){
        const {val,className} = this.props;
        let vals = val.split(':');
        let selfName = classNames(className,'sem-input');
        return(
            <div className={selfName}>
                <div className="time-block">
                    <input value={vals[0]} type="text" onChange={(e)=>{this.timeChangeHandler(e.target.value,vals[1])}}/>
                    <span>:</span>
                    <input value={vals[1]} type="'text" onChange={(e)=>{this.timeChangeHandler(vals[0],e.target.value)}}/>
                </div>
                <img src={timeicon}/>
            </div>
        )
    }
}
export default TimeInput