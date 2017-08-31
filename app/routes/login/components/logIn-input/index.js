/**
 * Created by whj57 on 2016/12/8.
 */
import React from 'react'
import './style.scss'
import subClass from 'classnames'
const LoginInput = (props)=>{
    let {val,imgSrc,title,inputChange,classNames,type,isFocus,changeIsFocus} = props;
    let name = subClass('login-input',classNames,{
        'focus':isFocus
    });
    return(
        <div className={name} >
            <div className="input-title">
                <div className="image" style={{backgroundImage:`url(${imgSrc})`}}></div>
                <div className="word">{title}</div>
            </div>
            <input  type={type} value={val} onChange={(e)=>{inputChange(e.target.value)}}
            onFocus={()=>changeIsFocus(true)} onBlur={()=>changeIsFocus(false)}/>
        </div>
    )

}
LoginInput.defaultProps = {
    val:'',
    imgSrc:'',
    title:'',
    inputChange:()=>{},
    isFocus:false,
    changeIsFocus:()=>{}
}
module.exports = LoginInput
