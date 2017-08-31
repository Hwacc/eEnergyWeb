/**
 * 创建于：2016-6-8
 * 创建人：杨骐彰
 * 说明：表单组件
 */
import React from 'react'
import classnames from 'classnames'
import './style.scss'

export const Input = (props)=>{
    let className = classnames('sem-form-control', props.className, {
        block: props.block,
        thin: props.size === 'thin'
    });

    return(
        <div className={className} style={props.style}>
            {
                props.children
            }
        </div>
    )
}

export const TextArea = (props)=>{
    let className = classnames('sem-form-control', props.className, {
        block: props.block,
        thin: props.size === 'thin'
    });
    return(
        <div className={className}>
            {   
                props.children
            }
        </div>
    )
}

export default {
    Input,
    TextArea
}
