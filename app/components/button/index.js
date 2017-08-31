/**
 * 创建于：2016-5-23
 * 创建人：杨骐彰
 * 说明：按钮组件
 */
import React,{Component} from 'react'
import classNames from 'classnames'
import './style.scss'

var Button = React.createClass({
    render() {
        const {className, children, type, hasAddOn,size}   = this.props;
        let classes = classNames('sem-button', className, {
            'outline': type === 'outline',
            'has-add-on': hasAddOn,
            'thin': size === 'thin'
        });
        return (
            <button
                {...this.props}
                className={classes}>
                {children}
            </button>
        )
    }
});

/**
 * 额外元素
 */
Button.AddOn = React.createClass({
    render(){
        const {src} = this.props;
        let style = {
            backgroundImage: `url(${src})`
        }
        return (
            <span className="add-on" style={style}>
            </span>
        )
    }
});

export default Button
