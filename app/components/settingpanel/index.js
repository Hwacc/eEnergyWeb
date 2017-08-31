/**
 * Created by whj on 2016/6/27.
 * 说明：空调设置面板
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import CheckPanel from 'checkpanel'
import Temperature from 'temperature'
import WindControl from 'windcontrol'

import {airControl} from 'icons'
import './style.scss'
export  default class SettingPanel extends BaseComponent{
    constructor(){
        super(...arguments);
    }
    render(){
        const {typeControl,temperature,windSpeed,windDirection} = this.props.editableData;
        const {handleClick,handleAdd,handleReduce,handleSpeed,handleDirection}=this.props
        let imgSpeed = [
            {img:airControl.autoMiddle,
            imgChecked:airControl.autoMiddleChecked},{
            img:airControl.speed1,
            imgChecked:airControl.speed1Checked}, {
            img:airControl.speed2,
            imgChecked:airControl.speed2Checked},{
            img:airControl.speed3,
            imgChecked:airControl.speed3Checked
        }]
        let imgDirection = [{
            img:airControl.autoMiddle,
            imgChecked:airControl.autoMiddleChecked},{
            img:airControl.windLeft,
            imgChecked:airControl.windLeftChecked},{
            img:airControl.windMiddle,
            imgChecked:airControl.windMiddleChecked},{
            img:airControl.windRight,
            imgChecked:airControl.windRightChecked
        }]

        return(
            <div className="panel-parent">
                <div className="panel-func">
                    <CheckPanel src={typeControl==0?airControl.autoControlChecked:airControl.autoControl}
                    handleClick={()=>{handleClick(0)}}
                    text="自动" checked={typeControl==0}/>
                    <CheckPanel src={typeControl==1?airControl.coldControlChecked:airControl.coldControl}
                                handleClick={()=>{handleClick(1)}}
                                text="制冷" checked={typeControl==1}/>
                    <CheckPanel src={typeControl==2?airControl.hotControlChecked:airControl.hotControl}
                                handleClick={()=>{handleClick(2)}}
                                text="制热" checked={typeControl==2}/>
                    <CheckPanel src={typeControl==3?airControl.xeransisControlChecked:airControl.xeransisControl}
                                handleClick={()=>{handleClick(3)}}
                                text="除湿" checked={typeControl==3}/>
                    <CheckPanel src={typeControl==4?airControl.windControlChecked:airControl.windControl}
                                handleClick={()=>{handleClick(4)}}
                                text="送风" checked={typeControl==4}/>
                </div>
                <div className="panel-temperature">
                    <Temperature temperature={temperature} handleAdd={handleAdd}
                    handleReduce={handleReduce}/>
                </div>
                <div className="panel-airspeed">
                    <WindControl imgs = {imgSpeed} value = {windSpeed} text="风速"
                                 handleClick = {handleSpeed}/>
                    <WindControl imgs = {imgDirection} value = {windDirection} text="风向"
                                 handleClick={handleDirection}/>
                 </div>

            </div>
        )
    }
}
module.exports = SettingPanel;
