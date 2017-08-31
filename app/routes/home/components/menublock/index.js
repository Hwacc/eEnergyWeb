/**
 * Created by 栗子哥哥 on 2016/11/28.
 */
/**
 * 创建于：2016-5-11
 * 创建人：杨骐彰
 * 说明： 主页面侧边菜单栏
 */
import React,{Component} from 'react'
import {Link} from 'react-router'
import './menublock.scss'

//分类菜单
const MenuBlock = (props)=>{
    const {id,blocks,isMain} = props;
    let block = blocks[id];
    if(block.isMenu){
        return (
            <div className="menu-block"
                 style={isMain?{display:'none'} : {}}
            >
                <ul className="menu-list"
                    style={blocks[1].isLink?{ paddingLeft: '265px', float:'left',textAlign:'left'}:{}}
                >
                    {
                        block.list.map((item, i)=> {
                            if(item.title){
                                if(item.title === '系统管理'){
                                    return(
                                        <li  key={i} onClick={()=>{auth.unAuthorize(()=>{
                                            props.router.replace('login')
                                        })}}>
                                            <span></span>
                                        </li>
                                    )
                                }else{
                                    return (
                                        <li  key={i}>
                                            <Link to={item.href} activeClassName="active">
                                                {item.title}
                                                <span></span>
                                            </Link>
                                        </li>
                                    )
                                }
                            }
                        })
                    }
                </ul>
            </div>
        )
    }else {
        return<div></div>
    }
};

MenuBlock.propTypes = {
    block: React.PropTypes.object
};
export default MenuBlock;