/**
 * 创建于：2016-5-23
 * 创建人：杨骐彰
 * 说明：设备地址选择公共组件
 */

import React from 'react'
import BaseComponent from '../basecomponent'
import {findDOMNode} from 'react-dom'
import Panel from '../panel'
import List from '../list'
import Checkbox from '../checkbox'
import SearchBox from '../searchbox'
import CommunitySelect from 'communityselect'
import GroupSelect from 'groupselect'
import PreLoader from '../preloader'
import apis from 'apis'
import store from 'store'

function getOffsetTop(node) {
    let top = 0;
    while (node && node !== document) {
        top += node.offsetTop;
        node = node.offsetParent;
    }
    return top;
}


function hasScroll(node) {
    return node.clientWidth?node.offsetWidth - node.clientWidth:0;
}

class DeviceAddressMiddleBar extends BaseComponent {
    constructor() {
        super(...arguments);
        this.state = {
            allSelect: false,
            //小区列表
            communityList: [],
            //当前小区
            communityValue: '',
            //分组列表
            groupList: [],
            //当前列表
            groupValue: '',
            //分组详情
            groupDetail: null,
            //设备列表
            deviceList: [],
            isLoadingDevice: false,
            searchName:'',
            isSearch:false
        };

        //页面大小变化处理
        this._handleResize = function () {
            let panelBodyDOM = findDOMNode(this.refs.panelBody);
            let panelHeaderCheckboxDOM = findDOMNode(this.refs.headerCheckbox);
            let top = getOffsetTop(panelBodyDOM);
            panelBodyDOM.style.maxHeight = window.innerHeight - top - 10 + 'px';
            panelHeaderCheckboxDOM.style.right = hasScroll(panelBodyDOM) + 12 + 'px';

        }.bind(this);
    }

    /**
     * 加载分组详情
     */
    loadGroupDetail(id) {
        let {groupDetail} = this.state;
        this.setState({deviceList:[]});
        if(id){
            this.groupDetailRP && this.groupDetailRP.request.abort();
            this.groupDetailRP = apis.group.getGroupDetailByID(id);
            this.registerRequest(this.groupDetailRP.request);
            this.setState({
                groupValue: id,
                isLoadingDevice: true,
                allSelect: false
            });
            this.groupDetailRP.promise
                .then((res)=> {
                    let data = res.Data;
                    if (data.Devices && data.Devices.length) {
                        data.Devices[0].Checked = true;
                        this.props.onSelectDevicesChange([data.Devices[0]],data.Area.Name);
                    }
                    else {
                        this.props.onSelectDevicesChange([]);
                    }
                    this.setState({
                        groupDetail: data,
                        isLoadingDevice: false,
                        deviceList: data.Devices || []
                    },()=>{this.clickDeviceAll()});
                })
                .catch((err)=> {
                    if (!err.abort) {
                        this.setState({
                            isLoadingDevice: false
                        });
                        alert(err.msg);
                    }
                })        }

    }

    /**
     * 处理校区更改
     * @param id
     */
    handleCommunityChange(id) {
        this.setState({
            communityValue: id
        });
    }

    componentDidMount() {
        window.addEventListener('resize', this._handleResize, false);
        this._handleResize();

    }

    componentWillUnmount() {
        super.componentWillUnmount();
        window.removeEventListener('resize', this._handleResize);
    }

    /**
     * 全选或反选
     */
    clickDeviceAll() {
        let {allSelect,deviceList,groupDetail} = this.state;
        allSelect = !allSelect;
        //改变全部选择状态
        deviceList.forEach((i)=>i.Checked = allSelect);
        this.setState({
            deviceList: deviceList,
            allSelect: allSelect
        });

        this.props.onSelectDevicesChange(deviceList.filter((d)=>d.Checked),groupDetail.Area.Name);
        this.props.onSelectedAll();
    }

    /**
     * 设备列表项被点击
     * @param d
     */
    clickDeviceItem(d) {
        const {deviceList,groupDetail} = this.state;
        deviceList.forEach((i)=> {
            if (i.Id === d.Id) {
                i.Checked = !i.Checked;
            }
        });

        let allSelect;
        //检查是否全选
        if (deviceList.every((i)=>i.Checked)) {
            allSelect = true;
        }
        else {
            allSelect = false;
        }
        this.setState({
            deviceList: deviceList,
            allSelect: allSelect
        });
        let name = groupDetail.Area.Name;
        this.props.onSelectDevicesChange(deviceList.filter((d)=>d.Checked),name);
    }

    render() {
        const {deviceList,allSelect,communityValue,groupValue,isLoadingDevice,searchName,
            isSearch,searchValue} = this.state;
        var reg = new RegExp(searchValue, 'gi');
        return (
            <div className="sem-middle-bar device-address-list">
                <div className="search-condition-row" style={{fontSize:0}}>
                    <CommunitySelect value={communityValue}
                                     style={{width:115,marginRight:6,minWidth:'auto'}}
                                     label={false}
                                     className="distanceX"
                                     allowEmpty={false}
                                     onChange={(c)=>{
                                         this.handleCommunityChange(c);
                                         store.set('communityId',c)}}
                    />
                    {communityValue&&<GroupSelect value={groupValue}
                                 style={{width:115,minWidth:'auto'}}
                                 label={false}
                                 cid={communityValue}
                                 allowEmpty={false}
                                 onChange={(c)=>{this.loadGroupDetail(c)}}
                    />}
                </div>
                <div className="search-condition-row">
                    <SearchBox block={true}
                               placeholder="设备昵称搜索"
                               value={searchName}
                               onChange={(e)=>{this.setState({searchName:e.target.value});this.setState({isSearch:true})}}
                               onSearch={()=>{
                               this.setState({searchValue:searchName});
                               this.setState({isSearch:false})
                               }}
                    />
                </div>
                <Panel>
                    <Panel.Header text="设备昵称">
                        <Checkbox ref="headerCheckbox" checked={allSelect} onClick={this.clickDeviceAll.bind(this)}/>
                    </Panel.Header>
                    <Panel.Body ref="panelBody">
                        {isLoadingDevice && <PreLoader />}
                        {!isSearch&&
                        <List striped="true" style={{fontSize:12}}>
                            {deviceList&&deviceList.length>0 && deviceList.map((i)=> {
                                return (
                                    reg.test(i.DeviceNick)
                                    &&<List.Item key={i.Id}
                                               onClick={()=>this.clickDeviceItem(i)}>
                                        <a href="javascript:;">
                                            <Checkbox checked={i.Checked}/>{i.Sn}
                                            <div>{i.DeviceNick}</div>
                                        </a>
                                    </List.Item>
                                );
                            })}
                        </List>}
                        {
                            deviceList && deviceList.length === 0 &&
                            <p style={{textAlign:'center',paddingTop:10}}>
                                {isLoadingDevice?'正在加载数据':'没有数据'}
                            </p>
                        }
                    </Panel.Body>
                </Panel>
            </div>
        )
    }
}

DeviceAddressMiddleBar.propTypes = {
    onSelectDevicesChange: React.PropTypes.func.isRequired
};

export default DeviceAddressMiddleBar;
