/**
 * Created by whj57 on 2016/12/1.
 */
import React from 'react';
import './style.scss'
import {weather} from 'icons'
import classnames from 'classnames'
import {weatherCodeType} from 'utils/staticType'
function getWeatherCode(code) {
    switch (true) {
        case code == 0:
            return {code:2,name:'晴'};
        case 100 < code && code < 103:
            return {code:1,name:'多云'};
        case code == 500 || code == 501:
            return {code:3,name:'雾'}
        case code == 104:
            return {code:4,name:'阴'};
        case code == 305 || code == 300 || code == 309:
            return {code:5,name:'小雨'};
        case 300 < code && code < 305 || (code > 305 && code < 400):
            return {code:6,name:'大雨'};
        case  code == 400:
            return {code:7,name:'小雪'};
        case 400 < code && code < 500 :
            return {code:8,name:'大雪'};
        default:
            return {code:4,name:'阴'};
    }
}
export const Weather = (props)=>{
    let {className,t,code} = props;
    let weatherCode = getWeatherCode(code).code;
    let weatherName = getWeatherCode(code).name;
    let imgSrc = weatherCodeType[weatherCode]
    let names = classnames('weather-wrapper',className)
    return(
        <div className={names}>
            <div className="icon" style={{backgroundImage:`url(${imgSrc})`}}></div>
            <div className="name">{weatherName}</div>
            <span style={{fontSize: 28}}>{t}</span>
            <span className="unit">℃</span>
        </div>
    )
}
Weather.defaultProps = {
    code:100,
    t:26,
}
module.exports = Weather
