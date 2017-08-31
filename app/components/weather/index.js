/**
 * Created by whj57 on 2016/12/1.
 */
import React,{Component} from 'react';
import './style.scss'
import {weather} from 'icons'
import classnames from 'classnames'
import {weatherCodeType} from 'utils/staticType'
class Weather extends Component{
    getWeatherCode(code){
        switch (true){
            case code == 0:
                return 2;
            case 100<code&&code<103:
                return 1;
            case code == 500 || code == 501:
                return 3
            case code==104:
                return 4;
            case code == 305 || code == 300 || code == 309:
                return 5;
            case 300<code&&code<305||(code>305&&code<400):
                return 6;
            case  code == 400:
                return 7;
            case 400<code&&code<500 :
                return 8 ;
            default:
                return 4;
        }

    }
    render(){
        let {className,t,code} = this.props;
        let weatherCode = this.getWeatherCode(code);
        let imgSrc = weatherCodeType[weatherCode]
        let names = classnames('weather-wrapper',className)
        return(
            <div className={names}>
                <div className="icon" style={{backgroundImage:`url(${imgSrc})`}}></div>
                {t}<span className="unit">℃</span>
            </div>
            )
    }
}
Weather.defaultProps = {
    code:100,
    t:26,

}
module.exports = Weather;