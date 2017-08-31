/**
 * 创建于：2016-5-12
 * 创建人：杨骐彰
 * 说明： 主页面内容容器
 */
import React,{Component} from 'react'
import './mainbody.scss'
const MainBody = (props)=>{
    let {isMain, isMini} = props;
    return (
        <div className={isMain?"sem-main-body is-main":"sem-main-body"}>
            {props.children}
        </div>
    )
}
module.exports = MainBody
