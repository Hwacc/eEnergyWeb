/**
 * 创建于：2016-5-11
 * 创建人：杨骐彰
 * 说明： 主页面侧边菜单栏
 */
import React, {Component} from 'react'
import {Link} from 'react-router'
import './sidebar.scss'
import auth from '../../../../auth'
import {withRouter} from 'react-router'

const SideBar  = (props)=>{
    let { blocks,isHiddenHandle,isHiddenSideBar,isMini,sidebarOpen,sidebarTouching} = props;
    return (
        <div className="sem-sidebar">
            {
                isMini&&<div className="sem-sidebar-hidden" onMouseEnter={() =>{isHiddenHandle(false)}}
                />
            }
            <div className="sem-menu-blocks" onMouseLeave={()=>{isMini&&isHiddenHandle(true)}}>
                {
                    blocks.map((block, i) => {
                        if(block.list){
                            return (
                                <div className="sem-blocks-wrapper" key={i}>
                                    <div className={block.isLink ? "sem-menu-block clicked" : "sem-menu-block"}>
                                        <Link to={sidebarTouching ? block.list[0].href:'#'} activeClassName="active"
                                              className={block.isLink ? "menu-title active" : "menu-title"}
                                              onClick={()=>{isHiddenSideBar(!sidebarOpen)}}>
                                            <i className={"menu-icon "}
                                               style={block.isLink ? {backgroundImage: `url(${block.iconChecked})`} : {backgroundImage: `url(${block.icon})`}}>
                                            </i>
                                            <div className="menu-word">
                                                {block.title}
                                            </div>
                                        </Link>
                                    </div>
                                </div>)
                        }else {
                            return (
                                <div className="sem-blocks-wrapper" key={i}>
                                    <div className={block.isLink ? "sem-menu-block clicked" : "sem-menu-block"}>
                                        <div className={block.isLink ? "menu-title active" : "menu-title"}
                                             onClick={()=>{auth.unAuthorize(()=>{
                                                 props.router.replace('login')
                                             })}}>
                                            <i className={"menu-icon "}
                                               style={block.isLink ? {backgroundImage: `url(${block.iconChecked})`} : {backgroundImage: `url(${block.icon})`}}>
                                            </i>
                                            <div className="menu-word">
                                                {block.title}
                                            </div>
                                        </div>
                                    </div>
                                </div>)
                        }

                    })
                }
            </div>
        </div>
    )
}

export default withRouter(SideBar);