/**
 * Created by whj57 on 2017/1/4.
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
import {TreeList,Tree} from 'redux-components/treeList'
import apis from 'apis'
import store from 'store'
import * as staticType from 'utils/staticType'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
import {getParentNode} from 'utils'
import {SideCondition,SideConditionChild} from 'redux-components/side-condition'
import Icons from 'icons'
import Switch from 'switch'
import ProgressBar from 'redux-components/progress-bar'
import auth from 'auth'
import AirControl from 'redux-components/aircontrol'
import './style.scss'
import ControlModal from './controlmodal'
import SwitchControlModal from './switchcontrolmodal'
import {Link} from 'react-router'


class Area extends BaseComponent {
    constructor() {
        super(...arguments);
        let selectStates = new SelectState([
            ['community',{}],
            ['devicesType',{options:[{value:staticType.deviceTypes.other,name:'其他'},
                {value:staticType.deviceTypes.airCondition, name:'空调'},
                {value:staticType.deviceTypes.lighting,name:'照明'}],
                allowEmpty:false,placeholder:'全部', value:staticType.deviceTypes.airCondition}],
            ['useTypes',{allowEmpty:true,placeholder:'全部'}]
        ]);


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
            deviceList: [],
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
            searchType:0,
            currentId:null,
            isShowInfoModal:false,
            isLoadedGroup: false,
            isFirst: true,
            currentGroupId:-1,
            treeData:null,
            status: true,
            num:[],
            userInfo:auth.getUser(),
            isShowControl:false,
            controlId:null,
            control:false,
            power:false,
            powerStatus: false,
            controlModalData:{},
            switchStatus:null,
            switchType:null,
            isShowSwitchControlModal:false,
            updateFlag:false,
            selectArea:'全部区域'
       
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
        let list  = this.props.list
        if(list.length>0){
            let communityId = store.get('communityId');
            let val = communityId||(list[0]?list[0].value:null);
            val = !selectStates.getSelect('community').multiple? val:[{value:val}];
            this.listSetSelectState('community',{
                options: list,
                isLoading: false,
                value:val,
            });
            let deviceTypeValue = (store.get('deviceType')==0 || store.get('deviceType')==1||store.get('deviceType')==2)?store.get('deviceType'): selectStates.getSelect('devicesType').value;
            this.listSetSelectState('devicesType',{
                options: selectStates.getSelect('devicesType').options,
                isLoading:false,
                value: deviceTypeValue
            });
            this.setState({sns:store.get('deviceName')||'',updateFlag:true},this.getGroupData(val));
        }

        let typeList = [
            {
                value:null,
                name:'全部'
            },
            {
                value:1,
                name:'在线'
            },
            {
                value:0,
                name:'离线'
            }
        ];
        this.listSetSelectState('useTypes',{
            options: typeList,
            isLoading: false,
        });
        this.setState({
            typeList:typeList
        })
    }

    /**
     * 查询
     */
    search(id) {
        const {sns,selectStates} = this.state;

        let currentGroupId;
        if(id){
            currentGroupId = id || this.state.currentGroupId;
        }else{
            currentGroupId = this.state.tokenId || this.state.currentGroupId;
        }

        let {treeData} = this.state;
        treeData && treeData.map((t) => {
            if (t.value == currentGroupId) {
                this.setState({treeDataClickLevel: t.level});
                this.setState({selectArea:t.name});
            }
        });

        this.deviceRP && this.deviceRP.request.abort();
        this.setState({
            isLoadingDeviceList: true,
            deviceList:[]
        });
        this.deviceRP = apis.device.deviceStatus2(selectStates.getSelect('devicesType').name||store.get('deviceTypeName')||'其他',
            id||(currentGroupId<0?null:currentGroupId),sns);
        this.registerRequest(this.deviceRP.request);
        this.deviceRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                let holder = selectStates.getSelect('useTypes').placeholder;
                if (holder === '全部') {
                    this.setState({
                        deviceList: data,
                        isLoadingDeviceList: false,
                    });
                    this.state.searchType = 0;
                } else if (holder === '在线') {
                    this.setState({
                        deviceList: this.cleanArray(
                            data.map((val) => {
                                // let temp = new Array();
                                let DeviceCapacities = val.DeviceCapacities;
                                for (let i = 0; i < DeviceCapacities.length; i++) {
                                    if (DeviceCapacities[i].IsOnline === 1) {
                                        // temp.push(val);
                                        return val;
                                    }
                                }
                            })
                        )
                    });
                    this.state.searchType = 1;
                } else if(holder === '离线'){
                     this.setState({
                        deviceList: this.cleanArray(data.map((val) => {
                            let DeviceCapacities = val.DeviceCapacities;
                            for (let i = 0; i < DeviceCapacities.length; i++) {
                                if (DeviceCapacities[i].IsOnline === 0 || DeviceCapacities[i].IsOnline === -1) {
                                    return val;
                                }
                            }
                        }))
                    });
                    this.state.searchType = 2;
                }
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert("没有找到数据");
                    this.setState({
                        isLoadingDeviceList: false,
                    });
                }
            })
    }

    cleanArray(actual){
        let newArray = new Array();
        for(let i = 0; i<actual.length; i++){
            if (actual[i]){
                newArray.push(actual[i]);
            }
        }
        return newArray;
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
                        loadingFailedText: err.message
                    });
                }
            })
    }
    componentDidMount(){
        this.setState({tokenId:this.props.location.query.id});
        this.getCommunityData()
    }

    componentDidUpdate(){
        if(this.props.list.length>0 && !this.state.updateFlag){
            this.getCommunityData();
        }
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
                    alert(err.message);
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
            isShowInfoModal:false
        });
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
                let areaTypes={};
                data.map(i=>{
                    areaTypes[i.Id] = i.Name;
                });
                let treeTop={};
                data.map((d,i)=>{
                    if(d.Id == id){
                        treeTop = d;
                        data.splice(i,1)
                    }
                });
                let list = data.map((c)=> {
                    let catalog = c.Path.split('/');
                    catalog.pop();
                    catalog.shift();
                    catalog.push(c.Id);
                    catalog = catalog.join('|');
                    return {
                        name: c.Name,
                        value: c.Id,
                        catalog:catalog,
                        groupType:c.GroupType
                    }
                });
                const dataTree = new Tree(list);
                const treeData = dataTree.init({name:'全部区域',value:treeTop.Id,level:0});
                this.setState({
                    isLoadingGroup:false,
                    treeData:treeData
                },()=>this.search(this.state.tokenId || this.state.currentGroupId))
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.message);
                    this.setState({
                        isLoadingGroup:false
                    })

                }
            })
    }


    handleAutoSearch(){
        const{isFirst,isLoadedGroup} = this.state;
        if(isFirst&&isLoadedGroup){
            this.setState({isFirst: false});
            this.search();
        }
    }

    onChangeStatus(e){
        let {deviceList,num}= this.state;
        deviceList&&deviceList.map((t,i)=>{
            num.length&&num.map(m=>{
                if(m==i){
                    t.PowerOn = e?true:false;
                }
            })
        });

    }


    //控制
    switchHandle(id,status,type){
        let postData = {
            DeviceIds: [id],
            DeviceOn: !status
        }
        modalLoading({loadingContent:"正在保存修改",key:'save'});
        this.deviceControlRP&&this.deviceControlRP.request.abort();
        this.deviceControlRP = apis.device.controlDevice(postData);
        this.deviceControlRP.promise
            .then((res)=>{
                this.controlT = setTimeout(
                    ()=>{
                        this.waiteTaskRP&&this.waiteTaskRP.request.abort();
                        this.waiteTaskRP = apis.device.WaitResult(res.Data.Id);
                        this.waiteTaskRP.promise.then((res)=>{
                            if(res.Data.State != 0){
                                this.afterControl(id,status,type);
                            }else{
                                this.switchHandle(id,status,type);
                            }
                        })
                    }
                    ,1000
                )
            })
            .catch((err)=>{
                if (!err.abort) {
                    alert(err.message);
                }
            })
            .done(()=> {
            })

    }

    //控制后
    afterControl(id,status,type){
        const {sns,selectStates,currentGroupId} = this.state;
        this.deviceRP && this.deviceRP.request.abort();
        this.setState({
            isLoadingDeviceList: true,
            deviceList:[]
        });
       /* let postData = {
            typeId:selectStates.getSelect('devicesType').value,
            gid:currentGroupId<0?null:currentGroupId,
            name:sns,
        }*/
        this.deviceRP = apis.device.deviceRoomState(selectStates.getSelect('devicesType').name||store.get('deviceTypeName')||'其他',
            (currentGroupId<0?null:currentGroupId),sns);
        this.registerRequest(this.deviceRP.request);
        this.registerRequest(this.deviceRP.request);
        this.deviceRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                let isSuccess = false;
                data.map(t=>{
                    t.DeviceStates.some(d=> {
                        if (d.Id == id) {
                            d.DeviceCapacities.map(m=>{
                                if (m.PowerOn === !status&&m.Type==type) {
                                    isSuccess = true
                                    return m.PowerOn === !status
                                }
                            })
                        } else {
                            return false
                        }
                    })
                })
                closeLoading('save')
                clearTimeout(this.controlT)
                if(isSuccess){
                    alert('修改成功')
                }else {
                    alert('修改失败')
                }
                this.setState({
                    deviceList: data,
                    isLoadingDeviceList: false,
                    isShowControl:false
                });
            })

            .catch((err)=> {
                if (!err.abort) {
                    alert(err.message);
                    this.setState({
                        isLoadingDeviceList: false,
                        deviceList: null
                    });
                }
            })
    }

    //创建上传电量任务
    createUploadTask(dId){
        let { deviceList } = this.state
        let localFirst = 0;
        let localSecond = 0;
        deviceList.map((d,i) => {
            if (d.Id === dId) {
                localFirst = i
                d['isLoading'] = true;
                d['isSuccess'] = false;
                d['isFail'] = false;
            }
        });
        this.setState({
            deviceList:deviceList
        })
        this.createTaskRP = apis.device.UploadTask(dId)
        this.registerRequest(this.createTaskRP.request)
        this.createTaskRP.promise
            .then((res) => {
                if(res.State ==65536){
                    deviceList[localFirst]['isLoading'] = false;
                    deviceList[localFirst]['isFail'] = true;
                    alert('该设备不支持上传功能！')
                }else{
                    if(res.Data.State == 1){
                        alert('上传成功')
                        deviceList[localFirst]['isLoading'] = false;
                        deviceList[localFirst]['isSuccess'] = true;
                        return 0
                    }
                    if(res.Data.State == 0){
                        this.waiteUploadTask(res.Data.Id, localFirst,localSecond)
                    } else {
                        deviceList[localFirst]['isLoading'] = false;
                        deviceList[localFirst]['isFail'] = true;
                        alert('上传失败')
                    }
                }

                this.setState({
                    deviceList:deviceList
                })
            })
            .catch((err) => {
                if (!err.abort) {
                    deviceList[localFirst]['isLoading'] = false;
                    deviceList[localFirst]['isFail'] = true;
                    alert(err.message)
                    this.setState({
                        deviceList:deviceList
                    })
                }
            })
    }
    //等待上传电量任务
    waiteUploadTask(tId, localFirst,localSecond){
        let { deviceList } = this.state
        this.waiteTaskRP && this.waiteTaskRP.request.abort()
        this.waiteTaskRP = apis.device.WaitResult(tId)
        this.registerRequest(this.waiteTaskRP.request)
        this.waiteTaskRP.promise
            .then(res => {
                if(res.Data.State == 1){
                    alert('上传成功')
                    deviceList[localFirst]['isLoading'] = false
                    deviceList[localFirst]['isSuccess'] = true
                    clearTimeout(this.t)
                    this.setState({
                        deviceList:deviceList
                    })
                } else if(res.Data.State == 0) {

                    this.t = setTimeout(()=>this.waiteUploadTask(tId, localFirst,localSecond),1000)
                } else {
                    alert('上传失败')
                    deviceList[localFirst]['isLoading'] = false
                    deviceList[localFirst]['isFail'] = true
                    this.setState({
                        deviceList:deviceList
                    })
                }
            })
            .catch((err) => {
                if (!err.abort) {
                    deviceList[localFirst]['isLoading'] = false
                    alert(err.message)
                    this.setState({
                        deviceList:deviceList
                    })
                }
            })
    }



    render() {
        const {community,sns,isLoadingDeviceList,deviceList,currentGroupId,controlId,control,switchType,switchStatus,isShowSwitchControlModal
            ,powerStatus,allSelect,selectStates,searchType,isLoadingGroup,controlModalData,treeData,isShowControl,controlData,power,measure,selectArea} = this.state

        return (
            <div className="sem-has-middle-bar list" onClick={()=>this.listSetSelectState(null,{open:false})}>
                <SideCondition >
                    <SideConditionChild  className="search" text="查询条件"  height="40%">
                        <div className="side-search">
                            <div className="search-title">查询条件</div>
                            <div className="search-child">
                                查询对象：
                                <MySelect onChange={(obj)=>this.listSetSelectState('community',obj)}
                                          {...selectStates.getSelect('community')} getData={()=>this.getCommunityData()}
                                          style={{width: '61%'}}>
                                    {selectStates.getSelect('community').open&&
                                    <SelectList {...selectStates.getSelect('community')}
                                                onChange={(obj,cb)=>{this.listSetSelectState('community',obj,cb);
                                                    obj.value&&this.getGroupData(obj.value);
                                                    obj.value && store.set('communityId',obj.value);
                                                    obj.name && store.set('communityName',obj.name);
                                                    obj.value && this.setState({tokenId:obj.value});
                                                    obj.value && this.getGroupData(obj.value);}}
                                    />}
                                </MySelect>
                            </div>
                            <div className="search-child">
                                监控类别：
                                <MySelect onChange={(obj)=>this.listSetSelectState('devicesType',obj)}
                                          {...selectStates.getSelect('devicesType')} style={{width:'44.7%'}}>
                                    {selectStates.getSelect('devicesType').open&&
                                    <SelectList {...selectStates.getSelect('devicesType')}
                                                onChange={(obj,cb)=>{this.listSetSelectState('devicesType',obj,cb);
                                                    store.set('deviceType',obj.value);
                                                    store.set('deviceTypeName',obj.name);
                                                    this.search()}}
                                    />}
                                </MySelect>
                            </div>
                           {/* <div className="search-child">
                                {(searchType === 0) &&
                                <div>
                                    <span>在线状态：</span>
                                    <Button className="btn"
                                            onClick={() => {this.listSetSelectState('useTypes', {placeholder: '全部'}, this.search(),0);this.state.searchType = 0}}>不限</Button>
                                    <Button className="btn" type="outline" size="thin"
                                            onClick={() => {this.listSetSelectState('useTypes', {placeholder: '在线'}, this.search(),1);this.state.searchType = 1}}>在线</Button>
                                    <Button className="btn" size="thin" type="outline"
                                            onClick={() => {this.listSetSelectState('useTypes', {placeholder: '离线'}, this.search(),2);this.state.searchType = 2}}>离线</Button>
                                </div>//全部
                                }

                                {(searchType === 1) &&
                                <div>
                                    <span>在线状态：</span>
                                    <Button className="btn" type="outline" size="thin"
                                            onClick={() => {this.listSetSelectState('useTypes', {placeholder: '全部'}, this.search(),0);this.state.searchType = 0}}>不限</Button>
                                    <Button className="btn"
                                            onClick={() => {this.listSetSelectState('useTypes', {placeholder: '在线'}, this.search(),1);this.state.searchType = 1}}>在线</Button>
                                    <Button className="btn" size="thin" type="outline"
                                            onClick={() => {this.listSetSelectState('useTypes', {placeholder: '离线'}, this.search(),2);this.state.searchType = 2}}>离线</Button>
                                </div>//在线
                                }
                                {(searchType === 2) &&
                                <div>
                                    <span>在线状态：</span>
                                    <Button className="btn" type="outline" size="thin"
                                            onClick={() => {this.listSetSelectState('useTypes', {placeholder: '全部'}, this.search(),0);this.state.searchType = 0}}>不限</Button>
                                    <Button className="btn" size="thin" type="outline"
                                            onClick={() => {this.listSetSelectState('useTypes', {placeholder: '在线'}, this.search(),1);this.state.searchType = 1}}>在线</Button>
                                    <Button className="btn"
                                            onClick={() => {this.listSetSelectState('useTypes', {placeholder: '离线'}, this.search(),2);this.state.searchType = 2}}>离线</Button>
                                </div>//离线
                                }
                            </div>*/}
                            <div className="search-child">
                                选择区域：
                                <div style={{width:'44.7%'}}>
                                    <Link to={{pathname:'/location',query:{from:'status',currentId:currentGroupId}}}>
                                        <div className="select-area"><div className="area-text" style={{marginLeft:'17px',overflow:'hidden'}}>{selectArea}</div><span className="icon"/></div>
                                    </Link>
                                </div>
                            </div>
                            <div className="search-child" style={{display:'block'}}>
                                <Button className="search-button" onClick={this.search.bind(this)}>查询</Button>
                            </div>
                        </div>
                    </SideConditionChild>
                </SideCondition>
                <div className="sem-main-content"  style={{border:'1px solid#dfdfdf',backgroundColor:'#ffffff'}}>

                    <div className="sem-air-control-wrapper">

                                    <AirControl data={deviceList}  createUploadTask={(id)=>this.createUploadTask(id)}
                                                switchHandle={(id,status,type)=>this.switchHandle(id,status,type)}
                                                onChange={(id,data)=>{this.setState({controlId:id,controlData:data,isShowControl:true})}}
                                                showSwitch={(a,b,c)=>this.setState({isShowSwitchControlModal: true,controlId:a,switchStatus:b,switchType:c})}
                                    >
                                    </AirControl>
                        <div style={{width: '100%'}}> </div>
                    </div>
                </div>
                {

                    isShowControl&&<ControlModal ids={controlId}
                                                 data = {controlData}
                                                 switchHandle={(id,status)=>{this.switchHandle(id,status)}}
                                                 onChange={(e)=>this.onChangeStatus(e)}
                                                 hideEditModal={()=>this.setState({isShowControl:false})}/>
                }


                {

                    isShowSwitchControlModal&&<SwitchControlModal ids={controlId} 
                                                                  status={switchStatus}
                                                                  type={switchType} 
                                                                  switchHandle={(id,status,type)=>{this.switchHandle(id,status,type);
                                                                  this.setState({isShowSwitchControlModal:false})}}
                                                                  hideEditModal={()=>this.setState({isShowSwitchControlModal:false})}/>
                }
            </div>
        )
    }
}



module.exports = Area;
