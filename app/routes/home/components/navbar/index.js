/**
 * 创建于：2016-5-11
 * 创建人：杨骐彰
 * 说明： 主页面页面顶部
 */
import React from 'react'
import {withRouter} from 'react-router'
import './navbar.scss'
import auth from 'auth'
import icons from 'icons'
import {Link} from 'react-router'
const Header = (props)=>(
    <div className="sem-navbar">
        <div className="brand">
            <img  className="icon"  src={icons.logo} />
            <div className="name">
                长虹智慧能源管理系统
            </div>
        </div>
        <ul className="nav">
            <li className="split">
            </li>
            <li className="user">
                <Link to='/home/account' >
                    <img className="icon" src={icons.administrator}/>
                </Link>
            </li>
            <li className="split">
            </li>
            <li className="logout" onClick={()=>{auth.unAuthorize(()=>{
                props.router.replace('login')
            })}}>
                <a href="javascript:;">
                    <img className="icon" src={icons.logout}/>
                </a>
            </li>
        </ul>
    </div>
);

export default withRouter(Header);
