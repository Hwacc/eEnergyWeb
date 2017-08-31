/**
 * 创建于：2016-6-8
 * 创建人：杨骐彰
 * 说明：表单组件
 */
import React,{Component} from 'react'
import classnames from 'classnames'

import './style.scss'

export class Input extends Component {
    render() {
        let classes = classnames('sem-form-control', this.props.className, {
            block: this.props.block,
            thin: this.props.size === 'thin'
        });
        return (
            <input {...this.props}
                className={classes}
            />
        )
    }
}

export class TextArea extends Component {
    render() {
        let classes = classnames('sem-form-control', this.props.className, {
            block: this.props.block,
            thin: this.props.size === 'thin'
        });
        return (
            <textarea {...this.props}
                className={classes}
            />
        )
    }
}

export default {
    Input,
    TextArea
}
