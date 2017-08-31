/**
 * 创建于：2016-5-23
 * 创建人：杨骐彰
 * 说明：按钮组件
 */
import React,{Component} from 'react'
import classNames from 'classnames'
import './style.scss'

const Button = (props)=>{
    const {className, children, type, hasAddOn,size,onClick,style,disabled}  = props;
    let classes = classNames('sem-button', className, {
        'outline': type === 'outline',
        'has-add-on': hasAddOn,
        'thin': size === 'thin',
    });
   
    return (
        <button
            style={style}
            disabled={disabled}
            onClick={()=>onClick()}
            className={classes}>
            {children}
        </button>
    )
};

/**
 * 额外元素
 */
Button.AddOn = (props)=>{
        const {src,style} = props;
        let _style = Object.assign({backgroundImage: `url(${src})`},style);
        return (
            <span className="add-on" style={_style}>
            </span>
        )
    };

export default Button
