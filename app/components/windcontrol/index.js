/**
 * Created by whj on 2016/6/28.
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'

import './style.scss'
class WindSpeed extends BaseComponent{
    render(){
        let {value,imgs,text,handleClick} = this.props;
        return(
            <div className="wind-speed">
                <div className="word">{text}</div>
                <div className="button-list">
                    {
                        imgs.map((item,index)=>{
                            var num =index
                            if(index==value){
                                return(
                                    <div className="wind-button checked" key={index}
                                         style={{backgroundImage:`url(${item.imgChecked})`}}
                                         onClick={()=>{ handleClick(num)}}>
                                    </div>
                                )
                            }else {
                                return (
                                    <div className="wind-button" key={index}
                                         style={{backgroundImage:`url(${item.img})`}}
                                         onClick={()=>{ handleClick(num)}}>
                                    </div>
                                )
                            }
                        })
                    }
                </div>
            </div>
        )
    }
}

export default class WindControl extends BaseComponent{
    constructor(){
        super(...arguments);
        this.state = {

        }
    }
    render(){
        let {imgs,value,text,handleClick} = this.props;
        return(
            <div className="wind-control"  >
                <WindSpeed imgs={imgs} value={value} 
                           text={text} handleClick={handleClick}/>
            </div>)

    }
}
module.exports = WindControl