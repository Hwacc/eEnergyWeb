
/**
 * Created by 栗子哥哥 on 2017/3/16.
 */
import React,{Component} from 'react'
import store from 'store'

class Status extends Component {

    componentWillUnmount(){
        store.remove('comId')
        store.remove('deviceType')
        store.remove('deviceName')
    }
    render() {
        let list = this.props.list;
        let childrenProps = Object.assign({},this.props.children.props,{list:list})
        return Object.assign({},this.props.children,{props:childrenProps})
    };
}
module.exports = Status;
