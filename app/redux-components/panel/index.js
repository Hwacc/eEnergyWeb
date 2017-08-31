/**
 * 创建于：2016-5-18
 * 创建人：杨骐彰
 * 说明： 面板组件
 */

import './style.scss'
let classNames = require('classnames');
import React from 'react'
//面板
const Panel = (props)=>{
    const {theme,children,className} = props;
    let _theme = theme ? `sem-panel-${theme}` : '';
    let _classes = classNames('sem-panel', className, _theme);
    return (
        <div
             className={_classes}>
            {children}
        </div>
    )
}

//面板头部
Panel.Header = (props)=>{
    const {text,children,align,className} = props;
    let _classes = classNames('sem-panel-header', className, {
        'right-title': align === 'right',
        'center-title': align === 'center'
    });
    return (
        <div
            className={_classes}>
                <span className="sem-panel-title">
                    {text}
                </span>
            {children}
        </div>
    )
}

//面板内容
Panel.Body = (props)=>{
    const {children,padding,className,ref} = props;
    let _classes = classNames('sem-panel-body', className, {
        'has-padding': padding
    });
    return (
        <div
            ref={ref}
             className={_classes}>
            {children}
        </div>
    )
}

export default Panel;

