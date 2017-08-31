/**
 * Created by whj on 2016/6/28.
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'

import './style.scss'

export  default class Temperature extends BaseComponent{
    constructor(){
        super(...arguments)
    }
    render(){
        const {temperature,handleAdd,handleReduce} = this.props;
        return(
            <div className="temperature">
                <div className="left"><div className="arrow-left" onClick={handleReduce}>
                </div></div>
                <div className="temperature-value">{temperature}℃</div>
                <div className="right"><div className="arrow-right" onClick={handleAdd}>
                </div></div>
            </div>
        )
    }
}
module.exports = Temperature;