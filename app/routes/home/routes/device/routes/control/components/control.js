/**
 * 创建于：2016-6-8
 * 创建人：杨骐彰
 * 说明： 设备控制
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import PanelTable from 'redux-components/paneltable'
import Table from 'redux-components/table'
import Button from 'redux-components/button'
import {Input} from 'redux-components/formcontrol'
import Checkbox from 'redux-components/checkbox'
import {TreeList,Tree} from 'redux-components/treeList'
import apis from 'apis'
import store from 'store'
import icons from 'icons'
import ControlModal from './controlmodal'
import LotSizeControl from './lotsizecontrol'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
import {SideCondition,SideConditionChild} from 'redux-components/side-condition'
const treeData = {
    "Data":[{
        "catalog":"1",
        "value":"1",
        "name":"a"
    },
        {
            "catalog":"2",
            "value":"2",
            "name":"b"
        },
        {
            "catalog":"3",
            "value":"3",
            "name":"c"
        },
        {
            "catalog":"1|1",
            "value":"4",
            "name":"d"
        },
        {
            "catalog":"1|2",
            "value":"5",
            "name":"e"
        },
        {
            "catalog":"1|3",
            "value":"6",
            "name":"f"
        },
        {
            "catalog":"1|2|1",
            "value":"7",
            "name":"g"
        },
        {
            "catalog":"2|1",
            "value":"8",
            "name":"h"
        },
        {
            "catalog":"2|2",
            "value":"9",
            "name":"j"
        },
        {
            "catalog":"3|1",
            "value":"10",
            "name":"k"
        },
        {
            "catalog":"3|2",
            "value":"11",
            "name":"l"
        },
        {
            "catalog":"3|1|1",
            "value":"12",
            "name":"m"
        },
        {
            "catalog":"3|2|1",
            "value":"13",
            "name":"n"
        },
        {
            "catalog":"3|1|2",
            "value":"14",
            "name":"o"
        },
        {
            "catalog":"3|1|2|1",
            "value":"15",
            "name":"p"
        },
        {
            "catalog":"3|1|2|2",
            "value":"16",
            "name":"q"
        },
        {
            "catalog":"3|1|2|3",
            "value":"17",
            "name":"r"
        }
    ]
};

class Control extends BaseComponent{
    constructor(){
        super(...arguments);
        const dataTree = new Tree(treeData.Data);
        const data = dataTree.init({name:'全部分类'});
        let selectStates =new SelectState([{type:'community'},
            {type:'group',label:'分组',placeholder:'不限',allowEmpty:true},{type:'devicesType',label:'设备类型',
            options:[{value:1,name:'插座'},{value:2,name:'电表'}],allowEmpty:true,placeholder:'全部'}]);
        this.state={
            //分组名称
            groupName:'',
            //管理区域
            community:null,
            //是否正在查询
            isLoadingDeviceList:false,
            //设备列表
            deviceList: null,
            //显示远程控制
            isShowControlModal:false,
            //显示批量控制
            isShowBatchModal:false,
            //当前选中分组
            activeGroupInfo:null,
            //设备号
            sns:'',
            //分组号
            group:null,
            //是否被全选
            allSelect:false,
            //当前点击的设备
            currentIds:[],
            //选中的设备
            idsChecked:[],
            isLoadedGroup: false,
            isFirst: true,
            //selects
            selectStates:selectStates.createState(),
            //treeData
            treeData:data,
            isLoadingGroup:false,
            currentGroupId:2,
        }
    }

    controlSetSelectState(type,obj,cb) {
        SelectState.setSelectState.call(this, type, obj,cb)
    }

    /*获取区域管理列表*/
    getCommunityData(){
        this.communityRP&&this.communityRP.request.abort();
        let {selectStates} = this.state;
        this.communityRP = apis.community.getCommunityList();
        this.registerRequest(this.communityRP.request);
        this.controlSetSelectState('community',{
            isLoading:true,
            isFailed:false
        });
        this.communityRP.promise
            .then((res)=> {
                let data = res.Data || [];
                let list = data.map((c)=> {
                    return {
                        name: c.Name,
                        value: c.Id
                    }
                });

                let communityId = store.get('communityId');
                list[0]&&this.getGroupData(communityId||list[0].value);
                let val = communityId||(list[0]?list[0].val:null);
                val = !selectStates[0].multiple? val:[{value:val}];
                this.controlSetSelectState('community',{
                    options: list,
                    isLoading: false,
                    value:val,

                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.controlSetSelectState('community',{
                        isLoading:false,
                        isFailed:true
                    });
                }
            })
    }
    /*获取分组*/
    getGroupData(id){
        this.groupRP && this.groupRP.request.abort();
        if (!id && id == 0)return;
        let {selectStates,isFirst} = this.state;
        this.groupRP = apis.group.getGroupListByCommunityID(id);
        this.registerRequest(this.groupRP.request);
        this.controlSetSelectState('group',{
            isLoading:true,
            isFailed:false
        });
        this.groupRP.promise
            .then((res)=> {
                let data = res.Data || [];
                let list = data.map((c)=> {
                    return {
                        name: c.Name,
                        value: c.Id
                    }
                });
                let val = list[0]?list[0].value:null;
                val = !selectStates[1].multiple? val:[{value:val}];
                if(isFirst){
                    this.search();
                    this.setState({
                        isFirst:false
                    })
                }
                this.controlSetSelectState('group',{
                    options: list,
                    isLoading: false,
                    value:val,
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.controlSetSelectState('group',{
                        isLoading:false,
                        isFailed:true
                    });
                }
            })
    }
    handleTreeList(item){
        let data = this.state.treeData;
        data = Tree.setShow(item,data);
        this.setState({treeData:data})
        
    }
    /**
     *
     * 查询
     */
    search(){
        const {sns,selectStates} = this.state;
        let community = selectStates[0].value
        let group = selectStates[1].value
        this.deviceRP&&this.deviceRP.request.abort();
        this.setState({
            isLoadingDeviceList:true,
            allSelect:false
        });
        this.deviceRP = apis.device.getDeviceList(sns,community,group);
        this.registerRequest(this.deviceRP.request);
        this.deviceRP.promise
            .then((res)=>{
                let data = res.Data||[];
                this.setState({
                    deviceList: data,
                    isLoadingDeviceList: false
                });
            })
            .catch((err)=>{
                if(!err.abort){
                    alert(err.msg);
                    this.setState({
                        isLoadingDeviceList:false,
                        deviceList:null
                    })
                }
            })
    }
    /**
     * 改变被选中状态
     * @param device
     */
    toggleCheckState(device) {
        const {deviceList} = this.state;
        device.Checked = !device.Checked;

        let allSelect;
        //检查是否全选
        if (deviceList.every((i)=>i.Checked)) {
            allSelect = true;
        }
        else {
            allSelect = false;
        }
        var ids=[];
        for(var i = 0,length = deviceList.length;i<length;i++){
            if(deviceList[i].Checked){
                ids.push(deviceList[i].Id)
            }
        }
        this.setState({
            deviceList: deviceList,
            allSelect: allSelect,
            idsChecked:ids
        });
    }
    /**
     * 全选或反选
     */
    toggleAllSelect() {
        let {allSelect,deviceList} = this.state;
        allSelect = !allSelect;
        //改变全部选择状态
        deviceList.forEach((i)=>i.Checked = allSelect);
        this.setState({
            deviceList: deviceList,
            allSelect: allSelect,
            idsChecked:deviceList.map((item)=>{
                return item.Id
            })
        });
    }
    /*
    关闭弹窗
     */
    hideEditModal() {
        this.deviceDetailRP && this.deviceDetailRP.request.abort();
        this.setState({
            isShowControlModal: false,
            isShowBatchModal: false
        });
    }
    
    handleAutoSearch(){
        const {isLoadedGroup,isFirst} = this.state;
        if(isFirst && isLoadedGroup){
            this.setState({isFirst: false});
            this.search();
        }
            
    }
    componentWillMount(){
        this.getCommunityData()
    }

    render(){
        let {community,isLoadingDeviceList,deviceList,isShowControlModal,treeData,isLoadingGroup,
            isShowBatchModal,selectStates,sns,currentGroupId,allSelect,currentIds,idsChecked} = this.state;
        return (
            <div className="sem-has-middle-bar" onClick={()=>this.controlSetSelectState(null,{open:false})}>
                <SideCondition>
                    <SideConditionChild className="search" text="查询条件">
                        <div className="side-search">
                            <MySelect onChange={(obj)=>this.controlSetSelectState('community',obj)}
                                      className="distanceY" {...selectStates[0]} getData={()=>this.getCommunityData()}>
                                {selectStates[0].open&&
                                <SelectList {...selectStates[0]}
                                            onChange={(obj,cb)=>{this.controlSetSelectState('community',obj,cb)}}
                                />}
                            </MySelect>
                            <MySelect onChange={(obj)=>this.controlSetSelectState('devicesType',obj)}
                                      className="distanceY"  {...selectStates[2]} >
                                {selectStates[2].open&&
                                <SelectList {...selectStates[2]}
                                            onChange={(obj,cb)=>{this.controlSetSelectState('devicesType',obj,cb)}}
                                />}
                            </MySelect>
                            <Input className="distanceY"><input
                                value={sns}
                                placeholder="设备名称"
                                onChange={(e)=>{this.setState({sns:e.target.value})}}/></Input>
                            <Button className="distanceY" onClick={this.search.bind(this)}>查询</Button>
                        </div>
                    </SideConditionChild>
                    <SideConditionChild className="list" text="选择区域">
                        <div className="group-condition-wrapper">
                            {isLoadingGroup?<PreLoader/>
                                : <TreeList data={treeData} onClick={(item)=>this.handleTreeList(item)}
                                            handleCheck={(val)=>this.setState({currentGroupId:val==currentGroupId?null:val})}
                                            isLoadingGroup={isLoadingGroup} value={currentGroupId}/>}
                        </div>
                    </SideConditionChild>
                </SideCondition>

                <div className="sem-main-content" >

                    <PanelTable text="设备列表"
                                align="center"
                                isLoading={isLoadingDeviceList}
                                loadingText="正在获取设备列表信息"
                    >
                        <div style={{height:'800px',overflow: 'hidden',
                            overflowY: 'auto'}}>
                            <Table>
                                <thead>
                                <tr>
                                    <th className="text-left"><Checkbox checked={allSelect}
                                                                        onClick={this.toggleAllSelect.bind(this)}/>序号</th>
                                    <th>设备昵称</th>
                                    <th >
                                        设备条码
                                    </th>
                                    <th>
                                        设备地址
                                    </th>
                                </tr>
                                </thead>
                                <Table.Body>
                                    {
                                        deviceList && deviceList.map((t, i)=> {
                                            return (
                                                <tr key={i}>
                                                    <td className="text-left">
                                                        <Checkbox checked={t.Checked} onClick={()=>this.toggleCheckState(t)}/>
                                                        {i+1}
                                                    </td>
                                                    <td>{t.DevieNick}</td>
                                                    <td>
                                                        {t.SN}
                                                    </td>
                                                    <td>{t.Address}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </Table.Body>
                            </Table>
                        </div>

                        {(!deviceList || !deviceList.length) && <h5 className="text-center">未查询或没有查询到结果</h5>}
                    </PanelTable>
                    <br/>
                    <Button className="distanceX"
                            type="outline"
                            hasAddOn={true}
                            onClick={()=>{idsChecked.length>0?this.setState({isShowBatchModal:true}):alert('请先选择设备')}}
                    >
                        <Button.AddOn
                            src={icons.batch}
                        />
                        批量控制
                    </Button>
                    {
                        isShowControlModal&&<ControlModal hideEditModal={this.hideEditModal.bind(this)} currentSns={currentIds}/>
                    }
                    {
                        isShowBatchModal&&<LotSizeControl hideEditModal={this.hideEditModal.bind(this)} sns={idsChecked}/>
                    }
                </div>
            </div>

        )
    }
}

module.exports = Control;