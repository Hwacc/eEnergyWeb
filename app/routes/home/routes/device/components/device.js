/**
 * 创建于：2016-6-8
 * 创建人：杨骐彰
 * 说明： 设备管理主页面
 */
import React,{Component} from 'react'

class Device extends Component {
    render() {
        let list = this.props.list;
        let childrenProps = Object.assign({},this.props.children.props,{list:list})
        
        return Object.assign({},this.props.children,{props:childrenProps})
    };
}

module.exports = Device;
