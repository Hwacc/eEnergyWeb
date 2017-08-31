/**
 * Created by whj on 2016/6/27.
 * 说明：选择开关
 */
import React,{Component} from 'react'
import classnames from 'classnames'
import './style.scss'

class Switch extends Component{
    render(){
        const {status,changeStatus,className,style,bigger} = this.props
        const classes = classnames(bigger?'switch-background bigger':'switch-background',className,{
            right:status==1,
            left:status==0
        })
        return(
            <div className={classes} onClick={changeStatus} style={style}>
                <div className={bigger?"switch-button bigger":"switch-button"}></div>
            </div>
        )
    }
}
Switch.defaultProps = {
    status :1,
    changeStatus:()=>{
    },
    className:''
};
module.exports = Switch;