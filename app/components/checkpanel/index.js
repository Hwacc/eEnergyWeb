/**
 * Created by whj on 2016/6/27.
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import classNames from 'classnames'
import './style.scss'
export default class CheckPanel extends BaseComponent{
    constructor(){
        super(...arguments)
    }
    render(){
        const {checked,src,text,handleClick} = this.props;
        const classes = classNames("check-item",classNames,{
            "checked":checked
        });
        return(
            <div className={classes} onClick={handleClick}>
                <div className="image" style={{backgroundImage:`url(${src})`}}></div>
                <div className="word">{text}</div>
            </div>
        )
    }
}