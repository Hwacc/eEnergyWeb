/**
 * Created by whj on 2016/6/13.
 */
import React,{Component} from 'react'

class System extends Component {
    render() {

        let list = this.props.list;
        let childrenProps = Object.assign({},this.props.children.props,{list:list})
        return Object.assign({},this.props.children,{props:childrenProps})
    };
}
module.exports = System;
