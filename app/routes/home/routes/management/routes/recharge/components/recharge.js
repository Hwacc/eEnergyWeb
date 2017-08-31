/**
 * 创建于：2016-6-8
 * 创建人：杨骐彰
 * 说明：设备列表页
 */

import React from 'react'
import BaseComponent from 'basecomponent'
import PanelTable from 'redux-components/paneltable'
import Table from 'redux-components/table'
import Button from 'redux-components/button'
import Checkbox from 'redux-components/checkbox'
import {Input} from 'redux-components/formcontrol'
import PreLoader from 'redux-components/preloader'
import Modal from 'modal'
import Download from 'download'
import UpLoader from 'uploader'
import {TreeList,Tree} from 'redux-components/treeList'
import config from '../../../../../../../config'
import icons from 'icons'
import EditModal from './editModal'
import InfoModal from  './infoModal'
import QRModal from './qrModal'
import apis from 'apis'
import store from 'store'
import {getParentNode} from 'utils'
import './style.scss'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
import Promise from 'q'
import {SideCondition,SideConditionChild} from 'redux-components/side-condition'
class Recharge extends BaseComponent {
    constructor() {
        super(...arguments);
        let selectStates = new SelectState([
            ['devicesType',{options:[{value: null,name:'全部'},{value:4,name:'插座'},{value:3,name:'电表'}],allowEmpty:true,placeholder:'全部'}],
            ['community',{}],
            ['useTypes',{options:[{value: null,name:'全部'}],allowEmpty:true,placeholder:'全部'}]
            ]
        );
        
        this.state = {
            //设备条码
            sns: '',
            //小区
            community: '',
            //分组
            group: '',
            //是否正在加载列表
            isLoadingDeviceList: false,
            //设备列表
            deviceList: null,
            //显示编辑弹窗
            isShowEditModal: false,
            //是否正在加载详情
            isLoadingDeviceDetail: false,
            //弹窗类型 1：编辑 0：详情
            modalType: 1,
            //设备详情
            deviceDetailInfo: {},
            //设备可编辑信息
            editableData: this.getEditableData(),
            //是否正在保存更改
            isSavingChange: false,
            //是否被全选
            allSelect: false,
            //是否开始下载
            downLoad:false,
            //上传
            uploader:false,
            //选中设备id
            //selects
            selectStates:selectStates,
            currentId:null,
            isShowInfoModal:false,
            isShowQRModal:false,
            isLoadedGroup: false,
            isFirst: true,
            currentGroupId:-1,
            treeData:null,
            currentNick: '',
           
           
        }
    }
    handleTreeList(item){
        let data = this.state.treeData;
        data = Tree.setShow(item,data);
        this.setState({treeData:data})
    }
    listSetSelectState(type,obj,cb) {
        let {selectStates} = this.state;
        if(type){
            if(Array.isArray(type)){
                selectStates.editSomeSelect(type,obj)
            }else {
                selectStates.editSelect(type,obj);

            }
        }else {
            selectStates.editAllSelect(obj)
        }
        this.setState({
            selectStates:selectStates
        },cb&&cb())
    }
   

    /**
     * 获取设备可编辑信息
     * @returns {{SN: string, Address: string, DeviceType: string, MainAdminPhone: string, AuxiAdminPhone: string, Nick: string}}
     */
    getEditableData(device) {
        if (device) {
            return {
                SN: device.SN || '',
                Address: device.Address || '',
                DeviceType: device.DeviceType || '',
                MainAdminPhone: device.MainAdminPhone || '',
                AuxiAdminPhone: device.AuxiAdminPhone || '',
                Nick: device.AuxiAdminPhone || []
            }
        }
        //重置
        else {
            return {
                SN: '',
                Address: '',
                DeviceType: '',
                MainAdminPhone: '',
                AuxiAdminPhone: [],
                Nick: ''
            }
        }
    }

    /**
     *
     * @param key
     * @param value
     */
    handleEditableDataChange(key, value) {
        let {editableData} = this.state;
        editableData[key] = value;
        this.setState({
            editableData: editableData
        });
    }
    /*获取区域管理列表*/
    getCommunityData(){
        let {selectStates} = this.state;
        this.communityRP = apis.group.getGroupListByCommunityID();
        this.useListRP = apis.energyInfo.getUseList();
        this.listSetSelectState('community',{
            isLoading:true,
            isFailed:false
        });
        this.setState({
            isLoadingGroup:true,
            treeData:[],
        });
        let requests = Promise.all([this.communityRP.promise,this.useListRP.promise]);
        requests
            .then((res)=> {
                if(!this.mounted)return;
                let data = res[0].Data || [];
                let list = getParentNode(data);

                let communityId = store.get('communityId');
                let val = communityId||(list[0]?list[0].value:null);
                val = !selectStates.getSelect('community').multiple? val:[{value:val}];
                this.getGroupData(val);
                this.listSetSelectState('community',{
                    options: list,
                    isLoading: false,
                    value:val,
                });
                let typeData = res[1].Data || [];
                let typeList = typeData.map(c => {
                    return {
                        name: c.m_Item2,
                        value: c.m_Item1,
                    }
                });
                typeList.unshift({value: null,name:'全部'});
                let typeVal = typeList[0]?typeList[0].value:null;
                typeVal = !selectStates.getSelect('useTypes').multiple? typeVal:[{value:typeVal}];
                this.listSetSelectState('useTypes',{
                    options: typeList,
                    isLoading: false,
                    value:typeVal,
                });
                this.setState({
                    typeList:typeList
                })

            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.listSetSelectState('community',{
                        isLoading:false,
                        isFailed:true
                    });
                }
            })
    }

    /**
     * 查询
     */
    search(id) {
        const {sns,selectStates,currentGroupId} = this.state;
        this.deviceRP && this.deviceRP.request.abort();
        this.setState({
            isLoadingDeviceList: true,
            allSelect: false
        });
        this.deviceRP = apis.device.getDeviceList(
            selectStates.getSelect('devicesType').value,selectStates.getSelect('useTypes').value,
            id||(currentGroupId<0?null:currentGroupId),sns);
        this.registerRequest(this.deviceRP.request);
        this.deviceRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                this.setState({
                    deviceList: data,
                    isLoadingDeviceList: false,
                });
            })

            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingDeviceList: false,
                        deviceList: null
                    });
                }
            })
    }

    /**
     * 查询设备详情
     * @param device
     */
    getDeviceDetail(device, type) {
        this.deviceDetailRP && this.deviceDetailRP.request.abort();
        this.setState({
            isShowEditModal: true,
            isLoadingDeviceDetail: true,
            deviceDetailInfo: {},
            modalType: type,
            isLoadingDeviceDetailFailed: false,
            loadingFailedText: null
        });
        this.deviceDetailRP = apis.device.getDeviceDetailInfo(device.Id);
        this.registerRequest(this.deviceDetailRP.request);
        this.deviceDetailRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                this.setState({
                    isLoadingDeviceDetail: false,
                    deviceDetailInfo: res.Data,
                    editableData: this.getEditableData(res.Data)
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    this.setState({
                        isLoadingDeviceDetail: false,
                        isLoadingDeviceDetailFailed: true,
                        loadingFailedText: err.msg
                    });
                }
            })
    }
    componentDidMount(){
        this.getCommunityData()
    }

    /**
     * 保存更改
     */
    savingChange() {
        this.deviceSaveRP && this.deviceSaveRP.request.abort();
        const {deviceDetailInfo,editableData}=this.state;
        this.setState({
            isSavingChange: true
        });
        this.deviceSaveRP = apis.device.saveDeviceInfoChange(deviceDetailInfo.Id, Object.assign(deviceDetailInfo, editableData));
        this.registerRequest(this.deviceSaveRP.request);
        this.deviceSaveRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                this.setState({
                    isSavingChange: false
                });
                this.hideEditModal();
                this.search();
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isSavingChange: false
                    });
                }
            })
    }

    /**
     * 关闭modal
     */
    hideEditModal() {
        this.deviceDetailRP && this.deviceDetailRP.request.abort();
        this.setState({
            isShowEditModal: false,
            isLoadingDeviceDetail: false,
            isShowInfoModal:false,
            isShowQRModal:false
        });
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
        this.setState({
            deviceList: deviceList,
            allSelect: allSelect
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
            allSelect: allSelect
        });
    }

    /**
     * 解绑设备
     */
    unbind() {
        let {deviceList} =this.state;
        let checkedList = [];
        if(deviceList&&deviceList.length>0){
            for(var i =0,length = deviceList.length;i<length;i++){
                if(deviceList[i].Checked){
                    checkedList.push(deviceList[i].Id);
                }
            }
        }
        var self = this;
        if(checkedList.length==0) {
            alert('请先选择设备')
        }else {
            //TODO:解绑设备
            Modal.confirm({
                title: '解绑提示',
                content: '解除绑定后，设备的信息将不再被任何普通用户查看到，确认解绑吗？',
                confirmText:'解绑',
                onConfirm:function(){
                    self.deviceUnbindRP = apis.device.unbindDevice(checkedList);
                    self.registerRequest(self.deviceUnbindRP.request);
                    self.deviceUnbindRP.promise
                        .then((res)=> {
                            if(res.State==0){
                                alert('解绑成功')
                            }else if(res.State==5){
                                alert('部分成功')
                            }else {
                                alert('失败')
                            }

                        })
                        .catch((err)=> {
                            if (!err.abort) {
                                alert(err.msg);
                                this.setState({
                                    isLoadingDeviceList: false,
                                    deviceList: null
                                });
                            }
                        })
                }
            });
        }

    }
    /*获取分组*/
    getGroupData(id){
        this.groupRP && this.groupRP.request.abort();

        if (!id && id == 0)return;
        this.groupRP = apis.group.getGroupListByCommunityID(id);
        this.registerRequest(this.groupRP.request);
        this.setState({
            isLoadingGroup:true,
            treeData:[],
            currentGroupId:id,
        });
        this.groupRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                let list = data.map((c)=> {
                    let catalog = c.Path.split('/');
                    catalog.pop();
                    catalog.shift();
                    catalog.push(c.Id)
                    catalog = catalog.join('|');
                    return {
                        name: c.Name,
                        value: c.Id,
                        catalog:catalog
                    }
                });
                const dataTree = new Tree(list);
                const treeData = dataTree.init({name:'全部区域',value:id});
                this.setState({
                    isLoadingGroup:false,
                    treeData:treeData
                },()=>this.search())

            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingGroup:false
                    })

                }
            })
    }

    /**
     * 开始下载
     * @returns {XML}
     */
    startLoadDown(){
        
    }
    handleAutoSearch(){
        const{isFirst,isLoadedGroup} = this.state;
        if(isFirst&&isLoadedGroup){
            this.setState({isFirst: false});
            this.search();
        }
    }

    render() {
        const {community,sns,isLoadingDeviceList,deviceList,isShowEditModal,currentGroupId
            ,allSelect,downLoad, uploader,isShowInfoModal,typeList,selectStates,isLoadingGroup,treeData,
        isShowQRModal} = this.state;
        return (
            <div>
                <div className="sem-has-middle-bar list" onClick={()=>this.listSetSelectState(null,{open:false})}>
                    <SideCondition >
                        <SideConditionChild  className="search" text="查询条件"  height="40%">
                            <Table align="left" noborder={true}>
                                <Table.Body className="side-search">
                                    <tr>
                                        <td>
                                            查询对象：
                                            <MySelect onChange={(obj)=>this.listSetSelectState('community',obj)}
                                                      {...selectStates.getSelect('community')} getData={()=>this.getCommunityData()}
                                                      style={{maxWidth:'130px'}}>
                                                {selectStates.getSelect('community').open&&
                                                <SelectList {...selectStates.getSelect('community')}
                                                            onChange={(obj,cb)=>{this.listSetSelectState('community',obj,cb);
                                                                obj.value&&this.getGroupData(obj.value)}}
                                                />}
                                            </MySelect>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            设备类型：
                                            <MySelect onChange={(obj)=>this.listSetSelectState('devicesType',obj)}
                                                      {...selectStates.getSelect('devicesType')} style={{maxWidth:'130px'}}>
                                                {selectStates.getSelect('devicesType').open&&
                                                <SelectList {...selectStates.getSelect('devicesType')}
                                                            onChange={(obj,cb)=>{this.listSetSelectState('devicesType',obj,cb)}}
                                                />}
                                            </MySelect>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            所属分类：
                                            <MySelect onChange={(obj)=>this.listSetSelectState('useTypes',obj)}
                                                      {...selectStates.getSelect('useTypes')} style={{maxWidth:'130px'}}>
                                                {selectStates.getSelect('useTypes').open&&
                                                <SelectList {...selectStates.getSelect('useTypes')}
                                                            onChange={(obj,cb)=>{this.listSetSelectState('useTypes',obj,cb)}}
                                                />}
                                            </MySelect>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            设备名称：
                                            <Input
                                                style={{maxWidth:'130px'}}>
                                                <input
                                                value={sns}
                                                placeholder="设备名称"
                                                onChange={(e)=>{this.setState({sns:e.target.value})}}/></Input>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{textAlign:'center'}}>
                                            <Button className="condition-button"  onClick={this.search.bind(this)}>查询</Button>
                                        </td>
                                    </tr>
                                </Table.Body>

                            </Table>
                        </SideConditionChild>
                        <SideConditionChild className="list" text="选择区域">
                            <div className="group-condition-wrapper" >
                                {isLoadingGroup?<PreLoader/>
                                    : <TreeList data={treeData} onClick={(item)=>this.handleTreeList(item)}
                                                handleCheck={(val)=>{this.setState({currentGroupId:val})
                                                this.search(val)}}
                                                value={currentGroupId}/>}
                            </div>
                        </SideConditionChild>
                    </SideCondition>
                    <div className="sem-main-content"  >
                        <PanelTable text="设备列表"
                                    align="center"
                                    isLoading={isLoadingDeviceList}
                                    loadingText="正在获取设备列表信息"
                        >
                            {
                                !isLoadingDeviceList&&<div>
                                    <div className="table-need-head">
                                        <Table>
                                            <thead>
                                            <tr>
                                                <th className="text-left">
                                                    <Checkbox checked={allSelect} onClick={this.toggleAllSelect.bind(this)}/>序号
                                                </th>
                                                <th>
                                                    设备编码
                                                </th>
                                                <th>
                                                    设备昵称
                                                </th>
                                                <th>
                                                    设备类型
                                                </th>
                                                <th>
                                                    所属分项
                                                </th>
                                                <th>
                                                    设备地址
                                                </th>
                                                <th>
                                                    设备绑定
                                                </th>
                                                <th>
                                                    操作
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
                                                                <td>{t.Sn}</td>
                                                                <td>{t.Nick}</td>
                                                                <td>{t.TypeName}</td>
                                                                <td>{t.UseName}</td>
                                                                <td>{t.Address}</td>
                                                                <td>
                                                                    <Table.Operate  text="生成二维码"
                                                                                   onClick={()=>{this.setState({
                                                                                       currentId:t,
                                                                                       isShowQRModal:true
                                                                                   })}}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <Table.Operate image={icons.modify} text="修改"
                                                                                   onClick={()=>{this.setState({
                                                                                       currentId:t,
                                                                                       isShowEditModal:true
                                                                                   })}}
                                                                    />
                                                                    <Table.Operate image={icons.detail} text="详情"
                                                                                   onClick={()=>{this.setState({
                                                                                       currentId:t,
                                                                                       isShowInfoModal:true
                                                                                   })}}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </Table.Body>
                                        </Table>

                                    </div>
                                    <div style={{height:'700px'}} className="table-need-body">
                                        <Table>
                                            <thead>
                                            <tr>
                                                <th className="text-left">
                                                    <Checkbox checked={allSelect} onClick={this.toggleAllSelect.bind(this)}/>序号
                                                </th>
                                                <th>
                                                    设备编码
                                                </th>
                                                <th>
                                                    设备昵称
                                                </th>
                                                <th>
                                                    设备类型
                                                </th>
                                                <th>
                                                    所属分项
                                                </th>
                                                <th>
                                                    设备地址
                                                </th>
                                                <th>
                                                    设备绑定
                                                </th>
                                                <th>
                                                    操作
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
                                                                <td>{t.Sn}</td>
                                                                <td>{t.Nick}</td>
                                                                <td>{t.TypeName}</td>
                                                                <td>{t.UseName}</td>
                                                                <td>{t.Address}</td>
                                                                <td>
                                                                    <Table.Operate  text="生成二维码"
                                                                                    onClick={()=>{this.setState({
                                                                                 
                                                                                       currentId:t,
                                                                                       isShowQRModal:true
                                                                                   })}}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <Table.Operate image={icons.modify} text="修改"
                                                                                   onClick={()=>{this.setState({
                                                                                       currentId:t,
                                                                                       isShowEditModal:true
                                                                                   })}}
                                                                    />
                                                                    <Table.Operate image={icons.detail} text="详情"
                                                                                   onClick={()=>{this.setState({
                                                                                       currentId:t,
                                                                                       isShowInfoModal:true
                                                                                   })}}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </Table.Body>
                                        </Table>
                                        {(!deviceList || !deviceList.length) && <h5 className="text-center">未查询或没有查询到结果</h5>}

                                    </div>
                                </div>
                            }

                        </PanelTable>
                        <br/>
                        <Button className="distanceX"
                                type="outline"
                                hasAddOn={true}
                                onClick={this.unbind.bind(this)}
                                style={{display:'none'}}

                        >
                            <Button.AddOn
                                src={icons.unbind}
                            />
                            解除绑定
                        </Button>
                        <Button
                            type="outline"
                            className="distanceX"
                            hasAddOn={true}
                            onClick={()=>{window.open(config.apiHost+"/DeviceExcel")}}
                            style={{display:"none"}}>
                            <Button.AddOn
                                src={icons.exports}
                            />
                            导出表格
                        </Button>
                        <Button className="distanceX"
                                type="outline"
                                hasAddOn={true}
                                style={{display:'none'}}
                                onClick={()=>{this.setState({uploader:true})}}>
                            <Button.AddOn
                                src = {icons.uploader}
                            />
                            导入表格
                        </Button>

                    </div>
                </div>
                {
                    downLoad&&<Download src='/DeviceExcel' />
                }
                {
                    uploader&&<UpLoader hideEditModal={()=>{this.setState({uploader:false})}}
                                        api={apis.excel.uploaderDevice}/>
                }
                {
                    isShowEditModal&&<EditModal hideEditModal={this.hideEditModal.bind(this)}
                                                search={this.search.bind(this)} currentId={this.state.currentId}
                                                typeList={typeList?typeList:[]}/>
                }
                {
                    isShowInfoModal&&<InfoModal hideEditModal={this.hideEditModal.bind(this)}
                                                currentId={this.state.currentId}/>
                }
                {
                    isShowQRModal&&<QRModal hideEditModal={this.hideEditModal.bind(this)}
                                                currentId={this.state.currentId}/>
                }
            </div>
        )
    }
}






module.exports = Recharge;
