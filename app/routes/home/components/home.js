/**
 * 创建于：2016-5-11
 * 创建人：杨骐彰
 * 说明： 主页面
 */

import React,{Component} from 'react'
import MainBody from './mainbody'
import auth from 'auth'
import {sidebar} from 'icons'
import classnames from 'classnames'
import {getParentNode} from 'utils'
import BaseComponent from 'basecomponent'
import apis from 'apis'
import App from '../../../components/app'
import SideBar from './new-sidebar'
import MenuBlock from './sidebar'
import $ from 'jquery'
const blocksSuper =[
    {
        id:1,
        title:'首页概览',
        icon:sidebar.homePage,
        iconChecked:sidebar.homePageChecked,
        list:[{
            href:'/home/home'
        }]

    },
    {
        id:2,
        title: '区域用能',
        icon: sidebar.leftArea,
        iconChecked:sidebar.leftAreaChecked,
        list: [{
            href: '/home/area'
        }]
    },
    {
        id:3,
        title: '用能排行',
        icon: sidebar.leftRange,
        iconChecked:sidebar.leftRangeChecked,
        list: [{
            href: '/home/rank'
        }]
     },
    
   /* {
        id:3,
        title: '分项用能',
        icon: sidebar.leftOption,
        iconChecked:sidebar.leftOptionChecked,
        list: [{
            href: '/home/apart'
        }]
    },*/
/*    {
        id:4,
        title: '报表',
        icon: sidebar.leftReports,
        iconChecked: sidebar.leftReportsChecked,
        list: [{
            href: '/home/statement'
        }]
    },*/ {
        id:5,
        title:'分析报告',
        icon:sidebar.leftReport,
        iconChecked:sidebar.leftReportChecked,
        list:[{
            href:'/home/analysisreport'
        }]
    },
    {
        id:6,
        title:'用电对比',
        icon:sidebar.leftContrast,
        iconChecked:sidebar.leftContrastChecked,
        isMenu:true,
        list:[{
            title: 'AB对比',
            href:'/home/compare/ab'
        }, {
            title: '前后对比',
            href:'/home/compare/frontback'
        }]
    },
  /*  {
        id:7,
        title:'电费管理',
        icon:sidebar.statusWatch,
        iconChecked:sidebar.statusWatchChecked,
        isMenu:true,
        list:[{
            title: '充值',
            href:'/home/management/recharge'
        },
            {
                title: '充值记录',
                href:'/home/management/rechargerecord'
            }]

    },*/
    {
        id:8,
        title:'状态监控',
        icon:sidebar.statusWatch,
        iconChecked:sidebar.statusWatchChecked,
        list:[/*{
            title:'列表模式',
            href:'/home/status/list'
        },*/{
            href:'/home/status'
        }]
    },
/*    {
        id:9,
        title: '设备管理',
        icon: sidebar.device,
        iconChecked: sidebar.deviceChecked,
        isMenu:true,
        list: [{
            title: '设备列表',
            href: '/home/device/list',
        }, {
            title: '设备分组',
            href: '/home/device/group',
        }]
    },*//*{
        id:6,
        title: '操作记录',
        icon: sidebar.leftRecord,
        iconChecked: sidebar.leftRecordChecked,
        list: [{
            title: '按设备查询',
            href: '/home/operationrecord/device'
        }, {
            title: '按管理员查询',
            href: '/home/operationrecord/user'
        }]
    },*/

   /* {
        id:10,
        title: '系统管理',
        icon: sidebar.system,
        iconChecked:sidebar.systemChecked,
        isMenu:true,
        list: [{
            title: '用户管理',
            href: '/home/system/usermanage',
        },{
            title:'小区管理',
            href:'/home/system/community',
        }]
    }*/
    {
        id:11,
        title:'退出登录',
        icon:sidebar.system,
        iconChecked:sidebar.systemChecked
    }
];
const blocksManager = [
    {
        id:1,
        title:'首页概览',
        icon:sidebar.homePage,
        iconChecked:sidebar.homePageChecked,
        list:[{
            href:'/home/home'
        }]

    },
    {
        id:2,
        title: '区域用能',
        icon: sidebar.leftArea,
        iconChecked:sidebar.leftAreaChecked,
        list: [{
            href: '/home/area'
        }]
    }, {
        id:3,
        title: '用能排行',
        icon: sidebar.leftOption,
        iconChecked:sidebar.leftOptionChecked,
        list: [{
            href: '/home/rank'
        }]
    },
   /* {
        id:3,
        title: '分项用能',
        icon: sidebar.leftOption,
        iconChecked:sidebar.leftOptionChecked,
        list: [{
            href: '/home/apart'
        }]
    },*/
/*    {
        id:4,
        title: '报表',
        icon: sidebar.leftReport,
        iconChecked: sidebar.leftReportChecked,
        list: [{
            href: '/home/statement'
        }]
    },*/
    {
        id:5,
        title:'分析报告',
        icon:sidebar.leftReport,
        iconChecked:sidebar.leftReportChecked,
        list:[{
            href:'/home/analysisreport'
        }]
    },
    {
        id:6,
        title:'用电对比',
        icon:sidebar.leftContrast,
        iconChecked:sidebar.leftContrastChecked,
        list:[{
            title: 'AB对比',
            href:'/home/compare/ab'
        }, {
            title: '前后对比',
            href:'/home/compare/frontback'
        }]
    },
  /*  {
        id:7,
        title:'电费管理',
        icon:sidebar.statusWatch,
        iconChecked:sidebar.statusWatchChecked,
        list:[{
            href:'/home/management'
        }]
    },*/
    {
        id:8,
        title:'状态监控',
        icon:sidebar.statusWatch,
        iconChecked:sidebar.statusWatchChecked,
        list:[/*{
            title:'列表模式',
            href:'/home/status/list'
        },*/{
            href:'/home/status'
        }]
    },


 /*   {
        id:9,
        title: '设备管理',
        icon: sidebar.device,
        iconChecked: sidebar.deviceChecked,
        isMenu:true,
        list: [{
            title: '设备列表',
            href: '/home/device/list',
        }, {
            title: '设备分组',
            href: '/home/device/group',
        }]
    },*/
   /* {
        id:10,
        title: '系统管理',
        icon: sidebar.system,
        iconChecked:sidebar.systemChecked,
        isMenu:true,
        list: [{
            title: '用户管理',
            href: '/home/system/usermanage',
        }]
    }*/
   {
        id:11,
        title:'退出登录',
        icon:sidebar.system,
        iconChecked:sidebar.systemChecked
    }
];
const RoleEnum = {
    1:{
        name:'超级管理员',
        value:1
    },
    2:{
        name:'普通管理员',
        value:2
    },
    3:{
        name:'普通用户',
        value:3
    },
    4:{
        name:'安装管理员',
        value:4
    }
};
let scrollCount = 0;
class Home extends BaseComponent {
    constructor(){
        super(...arguments);
        this.state = {
            isModel:false,
            userInfo:auth.getUser(),
            // isHidden:false,
            isLoadingGroup:false,
            list:[],
            sidebarOpen:false,
            sidebarTouching:false,
        }
        this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
        this.onSidebarTouch = this.onSidebarTouch.bind(this);
        this.onScrollBtnUpClick = this.onScrollBtnUpClick.bind(this);
        this.onScrollBtnDownClick= this.onScrollBtnDownClick.bind(this);
    }
    componentDidMount(){
        console.log('Main home did mount');
        console.log(this.state.list.length>0? 'list not empty':'list is empty');
        this.getCommunityData();
    }
    /*获取区域管理列表*/
    getCommunityData(){
        this.communityRP&&this.communityRP.request.abort();
        this.communityRP = apis.group.getGroupListByCommunityID();
        this.registerRequest(this.communityRP.request);
        this.setState({
            isLoadingGroup:true,
            list:[]
        });
        modalLoading({key:'community'});
        this.communityRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                let list = getParentNode(data);
                this.setState({
                    list:list,
                    isLoadingGroup:false
                })
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingGroup:false
                    });
                    if(err.code == -15 || err.code == -2){
                        App.prototype.onConfirmCallBack = ()=>{
                            auth.unAuthorize(()=>{
                                window.location.reload();
                            })
                        };
                    }
                }
            })
            .done(()=> {
                closeLoading('community');
            });
    }

    onSetSidebarOpen(open) {
        this.setState({sidebarOpen: open});
    }

    onSidebarTouch(touching){
        this.setState({sidebarTouching: touching});
    }

    onScrollBtnUpClick(){
        let charts = $('.charts-module');
        if(scrollCount >0 && scrollCount < charts.length){
            console.log("scrollCount = "+scrollCount);
            $('.navigationContent').animate({scrollTop:charts[scrollCount-1].offsetTop + 203},200);
            scrollCount -= 1;
        }else{
            scrollCount = 0;
            $('.navigationContent').animate({scrollTop:charts[scrollCount].offsetTop},200);
        }
    }

    onScrollBtnDownClick(){
        let charts = $('.charts-module');
        if(scrollCount < charts.length){
            $('.navigationContent').animate({scrollTop:charts[scrollCount+1].offsetTop + 203},200);
            scrollCount+=1;
        }else{
            scrollCount = charts.length-1
            $('.navigationContent').animate({scrollTop:charts[scrollCount].offsetTop},200);
        }
    }

    render(){
        let {userInfo, isHidden, isMini,list,isLoadingGroup,sidebarOpen,sidebarTouching} = this.state;
        let blocks = blocksManager;
        if(userInfo.RoleId==1){
            blocks = blocksSuper;
        }
        let path  = this.props.children.props.location.pathname;
        let num = 0;
        blocks = blocks.map((item,index)=>{
            if(item.list){
                item.isLink = item.list.some((i)=>{
                    return i.href == path;
                });
            }else{
                item.isLink = false;
            }
            if(item.isLink){
                num = index
            }
            return item
        });

        let className = classnames('wrapper')
        let isMain = path=== '/home/device/control'|| path==='/home/home'||path==="/home/status"||
            path==="/home/rank"|| path==='/home/area'|| path==='/home/apart'|| path==='/home/statement'|| 
            path==='/home/account' ||path==='/home/analysisreport';
        let childrenProps = Object.assign({},this.props.children.props,{list:list})
        let children = Object.assign({},this.props.children,{props:childrenProps});
        return (
            <SideBar
                 rootClassName="navigationRoot"
                 sidebarClassName="navigationSidebar"
                 contentClassName="navigationContent"
                 overlayClassName="navigationOverlay"
                 dragHandleClassName="drag"
                 sidebar={<MenuBlock path={path} blocks={blocks} style={{visibility:isLoadingGroup?'hidden':'hidden'}}
                                     sidebarOpen={sidebarOpen} sidebarTouching={sidebarTouching}
                                     isHiddenSideBar={(val)=>{this.onSetSidebarOpen(val)}} isHiddenHandle={(val)=>this.setState({isHidden:val})}/>}
                 open={sidebarOpen}
                 onSetOpen={this.onSetSidebarOpen}
                 onTouching={this.onSidebarTouch}
                 pullRight={true}
                 touchHandleWidth={80}
                 dragToggleDistance={0}
                 shadow={false}
                 showScrollBtn={path==='/home/analysisreport'}
                 scrollBtnUpClick = {this.onScrollBtnUpClick}
                 scrollBtnDownClick={this.onScrollBtnDownClick}
                 styles={{
                     sidebar:{
                         zIndex: 99,
                         height:'70%',
                         width:'100px',
                         backgroundColor:'white',
                         transition: 'transform .2s ease-out',
                         WebkitTransition: '-webkit-transform .2s ease-out',
                         top: 90,
                         opacity:0.55,
                     },
                     content: {
                         position: 'absolute',
                         top: 0,
                         left: 0,
                         right: 0,
                         bottom: 0,
                         overflowY: 'scroll',
                         WebkitOverflowScrolling: 'touch',
                     },
                     overlay:{
                         zIndex: -1,
                         opacity:0,
                     },
                     dragHandle:{
                         zIndex: 50,
                         height:'40px',
                         position: 'fixed',
                         backgroundColor:'#33363F',
                         top: 50,
                         bottom: 0,
                         marginRight:'-20px',
                         borderRadius:'20px',
                         opacity:0.55,
                         lineHeight:'40px',
                         alignItems:'center'
                     },
                 }}
            >
                <div className={className}>
                    <MainBody isMain={isMain} isMini={isMini}>
                        {children}
                    </MainBody>
                    {/*<MenuBlock blocks={blocks} id={num} />*/}
                    <div style={{display: 'none'}}>
                        {
                            list.map((i, n) => <div key={n}>{i.name}</div>)
                        }
                    </div>
                </div>
            </SideBar>
        )
    }
}
module.exports = Home;
