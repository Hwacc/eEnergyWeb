/**
 * 创建于：2016-5-19
 * 创建人：杨骐彰
 * 说明： checkbox组件
 */
import React from 'react'
import classNames from 'classnames'
import './style.scss'

const Checkbox =(props)=> {
    const {className,checked,onClick} = props;
    let classes = classNames("sem-checkbox", className, {
        'checked': checked
    });
    return (
        <div
            onClick={()=>onClick()}
            className={classes}>
        </div>
    )
};

Checkbox.propTypes = {
    checked: React.PropTypes.bool
};

export default Checkbox;
