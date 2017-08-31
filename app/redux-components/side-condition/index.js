/**
 * Created by whj57 on 2016/12/19.
 */
import React,{Component} from 'react';
import './style.scss'
import classnames from 'classnames'
import store from 'store'
import icons from 'icons'

/**
 * 侧边栏查询组件
 * */

export class SideCondition extends Component{
    constructor(){
        super(...arguments)
        this.state ={
            isShow:store.get('isShowCondition')||1
        }
    }
    render(){
        let style = this.props.style
        let styleBar = {top:0,height:16}
        let cb = this.props.callback
        if(this.state.isShow == 2){
            style = Object.assign({},style,{width:18,height:18,border:'0',backgroundColor:'transparent'})
            styleBar = Object.assign({},styleBar,{top:0,right:0})
        }

        return(
            <div className="condition-wrapper">
                <div className="condition-tool" style={styleBar} onClick={()=>{this.setState({isShow:this.state.isShow==1?2:1});
                    store.set('isShowCondition',this.state.isShow==1?2:1);cb&&setTimeout(cb,500)}}>
                    <img src={icons.condition} /> </div>
                <div className="sem-middle-bar search-condition" style={style}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}

export const SideConditionChild = (props)=>{
    let {className,_theme,height} = props;
    let _classes = classnames('search-condition-children', className, _theme)
    return(
        <div className={_classes} style={{height:height}}>
            {/*<div className="condition-title">{text}</div>*/}
            <div className="condition-body">
                {props.children}
            </div>
        </div>
    )
};
export default SideCondition
