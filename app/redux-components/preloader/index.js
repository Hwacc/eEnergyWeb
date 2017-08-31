/**
 * Created by qizhang on 5/9/16.
 * 加载信息组件
 */
import React, {Component} from 'react'
import loadingImage from './loading.gif'
import './style.scss'
import classnames from 'classnames'

const PreLoader = (props)=>{
    let {show,align,textColor,text,className }= props
    let classes = classnames('pre-loader', className, {
        show: show,
        align: align
    });
    return (
        <div
             className={classes}>
            <img src={loadingImage}/>
            <div style={{color:textColor}}>{text}</div>
        </div>
    )
}

module.exports = PreLoader;
