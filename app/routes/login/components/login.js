/**
 * 创建于：5/30/16
 * 创建人：qizhang
 * 说明：
 */
import React,{Component} from 'react'
import {withRouter} from 'react-router'
import {Link} from 'react-router'
import auth from 'auth'
import store from 'store'
import {login} from 'icons'
import CheckBox from '../../../redux-components/checkbox'
import LoginInput from  './logIn-input'
import './style.scss'
class Login extends Component {
    constructor(){
        super(...arguments);
        var username = store.get('username') ||'';
        var password = store.get('password')||'';
        this.state = {
            checked:false,
            user:{
                val:username,
                isFocus:false
            },
            password:{
                val:password,
                isFocus:false
            },
            isLogining:false,
        }
    }
    static getErrorMsgs(code){
        var msgs = {
            "-3":"找不到此用户",
            "-4":"密码错误",
            "-5":"非法参数",
            "-7":"用户没有登录该客户端的权限"
        }
        return msgs[code]
    }
    submit(){
        var self = this;
        let {user,password,isLogining} = this.state
        this.setState({isLogining:true},()=>{
            auth.authorize(user.val,password.val,(err, data) =>{
                if(err){
                    this.setState({isLogining:false})
                    var msg =  Login.getErrorMsgs(err.code);
                    var info = '';
                    msg?info=msg:info=err.msg;
                    return alert(info);
                }
                if(self.state.checked){
                    store.set('username',user.val);
                    store.set('password',password.val);
                }else {
                    store.remove('username');
                    store.remove('password');
                }
                this.props.router.replace('home');
            });
        })
    }
    componentDidMount(){
        let {isLogining} = this.state
        document.onkeydown=(event)=>{
            var e = event || window.event || arguments.callee.caller.arguments[0];
            //enter
            if(e && e.keyCode==13){
                    this.submit();
            }
        };
    }
    render() {
        let {checked,password,isLogining,user} = this.state;
        return (
            <div className="login" style={{backgroundImage:`url(${login.background})`}}>
                <div className="wrapper" style={{backgroundImage:`url(${login.map})`}}>
                    <div className="login-window">
                        {/*<div className="image title" style={{backgroundImage:`url(${login.logo})`}}></div>*/}
                        <div className="form-wrapper">
                            <div className="form">
                                <div className="form-title">请登录</div>
                                <LoginInput className="user" imgSrc={login.user} val={user.val}
                                            inputChange={(val)=>this.setState({user:Object.assign({},user,{val:val})})}
                                            title="用户名：" type="text" isFocus={user.isFocus}
                                changeIsFocus={(val)=>this.setState({user:Object.assign({},user,{isFocus:val})})}/>
                                <LoginInput className="password" imgSrc={login.password} val={password.val}
                                            inputChange={(val)=>this.setState({password:Object.assign({},password,{val:val})})}
                                            title="登录密码：" type="password" isFocus={password.isFocus}
                                            changeIsFocus={(val)=>this.setState({password:Object.assign({},password,{isFocus:val})})}/>
                                <div className="tools">
                                    <CheckBox className='login-checkbox'  checked={checked}
                                              onClick={()=>this.setState({checked:!checked})}/>
                                    <label className="login-checkbox-label">记住密码</label>
                                    {/*<Link  activeClassName="active" className="login-link" onClick={()=>{}}>忘记密码?</Link>*/}
                                </div>
                                <button className="login-btn" onClick={()=>{!isLogining&&this.submit()}}>
                                    {isLogining?'登录中':'登录'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
Login.contextTypes = {
    router: React.PropTypes.object
};
module.exports = withRouter(Login);