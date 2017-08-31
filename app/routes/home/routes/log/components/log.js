/**
 * Created by whj on 2016/6/13.
 */
import React,{Component} from 'react'

class Log extends Component {
    render() {

        let group = this.props.group;
        let childrenProps = Object.assign({},this.props.children.props,{group:group})
        return Object.assign({},this.props.children,{props:childrenProps})
    };
}
module.exports = Log;
