/**
 * 创建于：2016-5-18
 * 创建人：杨骐彰
 * 说明： 列表组件
 */

import './style.scss'
import React from 'react'
import classNames from'classnames'

//列表
const List = (props)=>{
    const {children,striped,bordered,className} = props;
    let classes = classNames('sem-list', className, {
        'sem-list-striped': striped,
        'sem-list-bordered': bordered
    });
    return (
        <ul {...props}
            className={classes}>
            {children}
        </ul>
    );
};

//列表项
 List.Item = (props)=>{
        const {children,className} = props;
        let classes = classNames('sem-list-item', className);
        return (
            <li {...props}
                className={classes}>
                {children}
            </li>
        );
 };

List.propTypes ={
    striped: React.PropTypes.string, 
    bordered: React.PropTypes.string
};

export default List
