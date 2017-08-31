/**
 * Created by qizhang on 5/9/16.
 * 加载信息组件
 */
import React, {Component} from 'react'
import loadingImage from './loading.gif'
import './style.scss'
import classnames from 'classnames'

export default class PreLoader extends Component {
    render() {
        let classes = classnames('pre-loader', this.props.className, {
            show: this.props.show,
            align: this.props.align
        });
        return (
            <div {...this.props}
                className={classes}>
                <img src={loadingImage}/>
                <div style={{color:this.props.textColor}}>{this.props.text}</div>
            </div>
        )
    }
}

module.exports = PreLoader;
