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
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
import * as staticType from 'utils/staticType'
import {getParentNode} from 'utils'
import {SideCondition,SideConditionChild} from 'redux-components/side-condition'
import ControlModal from './controlmodal'
import Icons from 'icons'
import Switch from 'switch'
import ProgressBar from 'redux-components/progress-bar'
import auth from 'auth'
import BatchModal from'./batchmodal'

class List extends BaseComponent {
    constructor() {
        super(...arguments);
        let selectStates = new SelectState([
            ['community',{}],
            ['devicesType',{allowEmpty:false,placeholder:'全部'}]
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
            currentId:[],
            isShowInfoModal:false,
            isLoadedGroup: false,
            isFirst: true,
            currentGroupId:-1,
            treeData:null,
            isShowControl:false,
            status: '0FFFFF',
            num:[],
            userInfo:auth.getUser(),
            isShowBatchModal:false,
            batchOpen:true,
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
            let communityId = store.get('comId') || store.get('communityId');
            let val = communityId||(list[0]?list[0].value:null);
            val = !selectStates.getSelect('community').multiple? val:[{value:val}];
            store.set('comId',val)
            this.getUseList(val)
           
            this.listSetSelectState('community',{
                options: list,
                isLoading: false,
                value:val,
            });
            this.setState({sns:store.get('deviceName')||''});
        }
    }



    getUseList(c){
        this.useListRP && this.useListRP.request.abort();
        this.useListRP = apis.energyInfo.getUseList(c);
        this.registerRequest(this.useListRP.request);
        this.useListRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                let list =[];
                if(data.length ==0){
                    list.unshift({value:'全部',name:'全部'});
                }else{
                    data.map(d=>{
                        list.push({value:d,name:d})
                    })
                }
                
                let deviceTypeValue =  list.length&&list[0].value;
                list.length&&list.map(l=>{
                    if(l.value == store.get('deviceType')){
                        deviceTypeValue = store.get('deviceType')
                    }
                });
                this.listSetSelectState('devicesType',{
                    options: list,
                    isLoading:false,
                    value: deviceTypeValue
                });
                this.getGroupData(c);
            })

            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                }
                this.getGroupData(c);
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
        let postData = {
            usetype:selectStates.getSelect('devicesType').value,
            gid:id||(currentGroupId<0?null:currentGroupId),
            name:sns,
        }
        this.deviceRP = apis.device.deviceStatus(postData);
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



    controlCondition(id,status){

        let num = status?'1FFFFF':'0FFFFF';
        let postData = {
            DeviceIds:id,
            ControlStr: num,

        };
        this.deviceControlRP&&this.deviceControlRP.request.abort();
        this.deviceControlRP = apis.device.controlDevice(postData);
        this.deviceControlRP.promise
            .then(()=>{
                alert('修改成功')
                this.search();
            })
            .catch((err)=>{
                if (!err.abort) {
                    alert(err.msg);
                }
            })
            .done(()=> {
                Modal.closeLoading();
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
                let treeTop={};
                data.map((d,i)=>{
                    if(d.Id == id){
                        treeTop = d;
                        data.splice(i,1)
                    }
                })
                let list = data.map((c)=> {
                    let catalog = c.Path.split('/');
                    catalog.pop();
                    catalog.shift();
                    catalog.push(c.Id)
                    catalog = catalog.join('|');
                    return {
                        name: c.Name,
                        value: c.Id,
                        catalog:catalog,
                        groupType:c.GroupType
                    }
                });
                const dataTree = new Tree(list)
                const treeData = dataTree.init({name:treeTop.Name,value:treeTop.Id});
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
            DeviceIds: id,
            DeviceOn: !status
        }
        
        this.deviceControlRP&&this.deviceControlRP.request.abort();
        this.deviceControlRP = apis.device.controlDevice(postData);
        this.deviceControlRP.promise
            .then((res)=>{
                modalLoading({loadingContent:"正在保存修改",key:'save'});
                this.controlT = setTimeout(()=>{this.afterControl(id[0],status,type)},1000)
            })
            .catch((err)=>{
                if (!err.abort) {
                    alert(err.msg)
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
         let postData = {
         usetype:selectStates.getSelect('devicesType').value,
         gid:currentGroupId<0?null:currentGroupId,
         name:sns,
         }
        this.deviceRP = apis.device.deviceStatus(postData);
        this.registerRequest(this.deviceRP.request);
        this.registerRequest(this.deviceRP.request);
        this.deviceRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                let isSuccess = false;
                data.some(d=>{
                    if(d.Id==id){
                        d.DeviceCapacities.map(m=>{
                            if (m.PowerOn === !status&&m.Type == type) {
                                isSuccess = true
                                return m.PowerOn === !status
                            }
                        })
                    }else {
                        return false
                    }
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
                    allSelect:false,
                });
                this.search();

            })

            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingDeviceList: false,
                        deviceList: null,
                        allSelect:false,
                    });
                }
            })

    }
    //创建上传电量任务
    createUploadTask(dId){
        let { deviceList } = this.state
        let local = 0
        deviceList.some((d,i) => {
            if(d.Id == dId){
                local = i
                deviceList[i]['isLoading'] = true
            }
        })
        this.setState({
            deviceList:deviceList
        })
        this.createTaskRP = apis.device.UploadTask(dId)
        this.registerRequest(this.createTaskRP.request)
        this.createTaskRP.promise
            .then((res) => {
                if(res.Data.State == 1){
                    deviceList[local]['isLoading'] = false
                    deviceList[local]['isSuccess'] = true
                    deviceList[local]['CurrentPower'] = res.Data.TotalPower
                    this.setState({
                        deviceList:deviceList
                    })
                    return 0
                }
                if(res.Data.State == 0){
                    this.waiteUploadTask(res.Data.Id, local)
                } else {
                    deviceList[local]['isLoading'] = false
                    deviceList[local]['isFail'] = true
                    alert('上传失败')
                }
                this.setState({
                    deviceList:deviceList
                })
            })
            .catch((err) => {
                if (!err.abort) {
                    deviceList[local]['isLoading'] = false
                    deviceList[local]['isFail'] = true
                    alert(err.msg)
                    this.setState({
                        deviceList:deviceList
                    })
                }
            })
    }
    //等待上传电量任务
    waiteUploadTask(tId, local){
        let { deviceList } = this.state
        this.waiteTaskRP && this.waiteTaskRP.request.abort()
        this.waiteTaskRP = apis.device.WaitResult(tId)
        this.registerRequest(this.waiteTaskRP.request)
        this.waiteTaskRP.promise
            .then(res => {
                if(res.Data.State == 1){
                    deviceList[local]['isLoading'] = false
                    deviceList[local]['isSuccess'] = true
                    deviceList[local]['CurrentPower'] = res.Data.Data.Data.TotalPower
                    clearTimeout(this.t)
                    this.setState({
                        deviceList:deviceList
                    })
                } else if(res.Data.State == 0) {

                    this.t = setTimeout(()=>this.waiteUploadTask(tId, local),1000)
                } else {
                    alert('上传失败')
                    deviceList[local]['isLoading'] = false
                    deviceList[local]['isFail'] = true
                    this.setState({
                        deviceList:deviceList
                    })
                }
            })
            .catch((err) => {
                if (!err.abort) {
                    deviceList[local]['isLoading'] = false
                    alert(err.msg)
                    this.setState({
                        deviceList:deviceList
                    })
                }
            })
    }



    showBatchModal(boolean){
        let {deviceList} =this.state;
        let checkedList= deviceList.filter(d=>{return d.Checked ==true});
        if(checkedList.length>0){
            this.setState({
                isShowBatchModal:true,
                batchOpen:boolean
            });
        }else{
           alert('请先选择需要控制的设备')
        }
    }
    render() {
        const {community,sns,isLoadingDeviceList,deviceList,currentGroupId,batchOpen
            ,allSelect,selectStates,isLoadingGroup,treeData,isShowControl,isShowBatchModal,status} = this.state
        let userInfo = store.get('ef_user_info')
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
                                                        onChange={(obj,cb)=>{this.listSetSelectState('community',obj,cb);store.set('comId',obj.value);
                                                            obj.value&&this.getGroupData(obj.value);obj.value&&this.getUseList(obj.value)}}
                                            />}

                                        </MySelect>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        监控类别：

                                        <MySelect onChange={(obj)=>this.listSetSelectState('devicesType',obj)}
                                                  {...selectStates.getSelect('devicesType')} style={{maxWidth:'130px'}}>
                                            {selectStates.getSelect('devicesType').open&&
                                            <SelectList {...selectStates.getSelect('devicesType')}
                                                        onChange={(obj,cb)=>{this.listSetSelectState('devicesType',obj,cb);store.set('deviceType',obj.value);
                                                            this.search()}}
                                            />}
                                        </MySelect>
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        设备名称：
                                        <Input style={{maxWidth:'130px'}}>
                                            <input
                                                value={sns}
                                                placeholder="设备名称"
                                                onChange={(e)=>{this.setState({sns:e.target.value});store.set('deviceName',e.target.value);}}/></Input>
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
                <div className="sem-main-content"  style={{border:'1px solid#dfdfdf',backgroundColor:'#ffffff'}}>
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
                                                设备名称
                                            </th>
                                            <th>计量仪器</th>
                                            <th>
                                                在线状态

                                            </th>
                                            <th>
                                                用电量
                                            </th>
                                            <th>操作</th>

                                        </tr>
                                        </thead>
                                        <Table.Body>
                                            {

                                                deviceList && deviceList.map((t, i)=> {
                                                    let style = {color: '#000000'};
                                                    let isOnline = t.IsOnline;
                                                    let isOnlineStatus='';
                                                    switch(isOnline){
                                                        case -1:  isOnlineStatus = '网关离线'; break;
                                                        case 0:  isOnlineStatus = '离线';style={color:'red'}; break;
                                                        case 1:  isOnlineStatus = '在线'; break;
                                                    }
                                                    let deviceCapacities = t.DeviceCapacities
                                                    let skip = 0
                                                    deviceCapacities.map((d,s)=>{
                                                        let same = 0 ;
                                                        if(s >= skip){
                                                            deviceCapacities.map(dd=>{

                                                                skip = s+1
                                                                if(dd.Id === d.Id){
                                                                    same++;
                                                                    skip++
                                                                }
                                                            })
                                                            d.same = same
                                                        }
                                                        d.skip = skip
                                                    })
                                                    return(deviceCapacities.map((d,ii)=>{
                                                        switch (d.Type){
                                                            case staticType.capacityType.measure:
                                                                return(
                                                                    ii ===0 ?<tr>
                                                                            <td rowSpan={t.DeviceCapacities.length} className="text-left">
                                                                                <Checkbox checked={t.Checked} onClick={()=>this.toggleCheckState(t)}/>
                                                                                {i+1}
                                                                            </td>
                                                                            <td rowSpan={t.DeviceCapacities.length}>{t.Sn}</td>
                                                                            <td rowSpan={t.DeviceCapacities.length}>{t.Nick}</td>
                                                                            <td style={style} rowSpan={d.same}>
                                                                                {
                                                                                    d.MeterType
                                                                                }
                                                                            </td>
                                                                            <td rowSpan={d.same}>
                                                                                {d.IsOnline?'在线':'离线'}
                                                                            </td>
                                                                            <td>
                                                                                {d.CurrentPower?d.CurrentPower.toFixed(2):'--'}
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    !t.isLoading?
                                                                                        (!t.isSuccess?
                                                                                                <Table.Operate image={Icons.uploaderNow}
                                                                                                               text="上传" onClick={()=>{
                                                                                                    this.createUploadTask(t.Id)
                                                                                                }}/>
                                                                                                :
                                                                                                <Table.Operate image={Icons.uploaderCompleted}
                                                                                                               text="上传成功" onClick={()=>{}}
                                                                                                               style={{color:'#79e289'}}
                                                                                                />
                                                                                        )
                                                                                        :
                                                                                        <ProgressBar isCompleted={!t.isLoading}/>


                                                                                }
                                                                            </td>
                                                                        </tr>:
                                                                        (
                                                                            ii+1<d.skip?
                                                                            <tr>
                                                                            <td style={style} rowSpan={d.same}>
                                                                                {
                                                                                    d.MeterType
                                                                                }
                                                                            </td>
                                                                            <td rowSpan={d.same}>
                                                                                {d.IsOnline?'在线':'离线'}
                                                                            </td>
                                                                            <td rowSpan={d.same}>
                                                                                {d.CurrentPower?d.CurrentPower.toFixed(2):'--'}
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    !t.isLoading?
                                                                                        (!t.isSuccess?
                                                                                                <Table.Operate image={Icons.uploaderNow}
                                                                                                               text="上传" onClick={()=>{
                                                                                                    this.createUploadTask(t.Id)
                                                                                                }}/>
                                                                                                :
                                                                                                <Table.Operate image={Icons.uploaderCompleted}
                                                                                                               text="上传成功" onClick={()=>{}}
                                                                                                               style={{color:'#79e289'}}
                                                                                                />
                                                                                        )
                                                                                        :
                                                                                        <ProgressBar isCompleted={!t.isLoading}/>


                                                                                }
                                                                            </td>
                                                                        </tr>:
                                                                                <tr>
                                                                                    <td>
                                                                                        {
                                                                                            !t.isLoading?
                                                                                                (!t.isSuccess?
                                                                                                        <Table.Operate image={Icons.uploaderNow}
                                                                                                                       text="上传" onClick={()=>{
                                                                                                            this.createUploadTask(t.Id)
                                                                                                        }}/>
                                                                                                        :
                                                                                                        <Table.Operate image={Icons.uploaderCompleted}
                                                                                                                       text="上传成功" onClick={()=>{}}
                                                                                                                       style={{color:'#79e289'}}
                                                                                                        />
                                                                                                )
                                                                                                :
                                                                                                <ProgressBar isCompleted={!t.isLoading}/>


                                                                                        }
                                                                                    </td>
                                                                                </tr>)
                                                                        );
                                                                break
                                                            case staticType.capacityType.switch:
                                                                return(ii ===0 ?<tr>
                                                                        <td rowSpan={t.DeviceCapacities.length} className="text-left">
                                                                            <Checkbox checked={t.Checked} onClick={()=>this.toggleCheckState(t)}/>
                                                                            {i+1}
                                                                        </td>
                                                                        <td rowSpan={t.DeviceCapacities.length}>{t.Sn}</td>
                                                                        <td rowSpan={t.DeviceCapacities.length}>{t.Nick}</td>
                                                                        <td style={style} rowSpan={d.same}>
                                                                            {
                                                                                d.MeterType
                                                                            }
                                                                        </td>
                                                                        <td rowSpan={d.same}>
                                                                            {d.IsOnline?'在线':'离线'}
                                                                        </td>
                                                                        <td rowSpan={d.same}>
                                                                            {d.CurrentPower?d.CurrentPower.toFixed(2):'--'}
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                <Switch status={d.PowerOn?1:0} style={{left:'50%',marginLeft:'-24px'}}
                                                                                        changeStatus={()=>this.switchHandle([t.Id], d.PowerOn,d.Type)}/>

                                                                            }
                                                                        </td>
                                                                    </tr>:

                                                                    (ii+1<d.skip?
                                                                        <tr>
                                                                            <td style={style} rowSpan={d.same}>
                                                                                {
                                                                                    d.MeterType
                                                                                }
                                                                            </td >
                                                                            <td rowSpan={d.same}>
                                                                                {d.IsOnline?'在线':'离线'}
                                                                            </td>
                                                                            <td rowSpan={d.same}>
                                                                                {d.CurrentPower?d.CurrentPower.toFixed(2):'--'}
                                                                            </td>
                                                                            <td >
                                                                                {
                                                                                    <Switch status={d.PowerOn?1:0} style={{left:'50%',marginLeft:'-24px'}}
                                                                                            changeStatus={()=>this.switchHandle([t.Id], d.PowerOn,d.Type)}/>


                                                                                }
                                                                            </td>
                                                                        </tr>:
                                                                        <tr>
                                                                            <td >
                                                                                {
                                                                                    <Switch status={d.PowerOn?1:0} style={{left:'50%',marginLeft:'-24px'}}
                                                                                            changeStatus={()=>this.switchHandle([t.Id], d.PowerOn,d.Type)}/>

                                                                                }
                                                                            </td>
                                                                        </tr>)
                                                                    );
                                                                break
                                                            case staticType.capacityType.control:
                                                                return(ii === 0?
                                                                    <tr>
                                                                        <td rowSpan={t.DeviceCapacities.length} className="text-left">
                                                                            <Checkbox checked={t.Checked} onClick={()=>this.toggleCheckState(t)}/>
                                                                            {i+1}
                                                                        </td>
                                                                        <td rowSpan={t.DeviceCapacities.length}>{t.Sn}</td>
                                                                        <td rowSpan={t.DeviceCapacities.length}>{t.Nick}</td>
                                                                        <td style={style} rowSpan={d.same}>
                                                                            {
                                                                                d.MeterType
                                                                            }
                                                                        </td>
                                                                        <td rowSpan={d.same}>
                                                                            {d.IsOnline?'在线':'离线'}
                                                                        </td>
                                                                        <td rowSpan={d.same}>
                                                                            {d.CurrentPower?d.CurrentPower.toFixed(2):'--'}
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                <Table.Operate image={Icons.control}
                                                                                               text="控制"
                                                                                               onClick={()=>this.setState({isShowControl:true,currentId:t.Id,status:d.LastInst})}/>

                                                                            }
                                                                        </td>
                                                                    </tr>:(ii+1<d.skip?
                                                                            <tr>
                                                                                <td style={style} rowSpan={d.same}>
                                                                                    {
                                                                                        d.MeterType
                                                                                    }
                                                                                </td>
                                                                                <td rowSpan={d.same}>
                                                                                    {d.IsOnline?'在线':'离线'}
                                                                                </td>
                                                                                <td rowSpan={d.same}>
                                                                                    {d.CurrentPower?d.CurrentPower.toFixed(2):'--'}
                                                                                </td>
                                                                                <td>
                                                                                    {
                                                                                        <Table.Operate image={Icons.control}
                                                                                                       text="控制"
                                                                                                       onClick={()=>this.setState({isShowControl:true,currentId:t.Id,status:d.LastInst})}/>

                                                                                    }
                                                                                </td>
                                                                            </tr>:<tr>
                                                                                <td>
                                                                                    {
                                                                                        <Table.Operate image={Icons.control}
                                                                                                       text="控制"
                                                                                                       onClick={()=>this.setState({isShowControl:true,currentId:t.Id,status:d.LastInst})}/>

                                                                                    }
                                                                                </td>
                                                                            </tr>)
                                                                    );
                                                                break

                                                        }
                                                    }))

                                                })
                                            }
                                        </Table.Body>
                                    </Table>
                                </div>
                                <div style={{height:'700px'}}
                                     className="table-need-body">
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
                                                设备名称
                                            </th>
                                            <th>计量仪器</th>
                                            <th>
                                                在线状态
                                            </th>
                                            <th>
                                                用电量
                                            </th>
                                            <th>操作</th>

                                        </tr>
                                        </thead>
                                        <Table.Body>
                                            {

                                                deviceList && deviceList.map((t, i)=> {
                                                    let style = {color: '#000000'};
                                                    function isOnline(isOnline){
                                                        let isOnlineStatus = ''
                                                        switch(isOnline){
                                                            case -1:  isOnlineStatus = '网关离线'; break;
                                                            case 0:  isOnlineStatus = '离线';style={color:'red'}; break;
                                                            case 1:  isOnlineStatus = '在线'; break;
                                                        }
                                                        return isOnlineStatus
                                                    }
                                                    let deviceCapacities = t.DeviceCapacities
                                                    let skip = 0
                                                    deviceCapacities.map((d,s)=>{
                                                        let same = 0 ;
                                                        if(s >= skip){
                                                            deviceCapacities.map(dd=>{
                                                                skip = s+1
                                                                if(dd.Id === d.Id){
                                                                    same++;
                                                                    skip++
                                                                }
                                                            })
                                                            d.same = same
                                                        }
                                                    })
                                                    return(deviceCapacities.map((d,ii)=>{
                                                        switch (d.Type){
                                                            case staticType.capacityType.measure:
                                                                return(
                                                                    ii ===0 ?<tr>
                                                                            <td rowSpan={t.DeviceCapacities.length} className="text-left">
                                                                                <Checkbox checked={t.Checked} onClick={()=>this.toggleCheckState(t)}/>
                                                                                {i+1}
                                                                            </td>
                                                                            <td rowSpan={t.DeviceCapacities.length}>{t.Sn}</td>
                                                                            <td rowSpan={t.DeviceCapacities.length}>{t.Nick}</td>
                                                                            <td style={style} rowSpan={d.same}>
                                                                                {
                                                                                    d.MeterType
                                                                                }
                                                                            </td>
                                                                            <td style={{color:d.IsOnline<1?'red':'#000000'}}
                                                                                rowSpan={d.same}>
                                                                                {isOnline(d.IsOnline)}
                                                                            </td>
                                                                            <td rowSpan={d.same}>
                                                                                {d.CurrentPower?d.CurrentPower.toFixed(2):'--'}
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    !t.isLoading?
                                                                                        (!t.isSuccess?
                                                                                                <Table.Operate image={Icons.uploaderNow}
                                                                                                               text="上传" onClick={()=>{
                                                                                                    d.IsOnline&&this.createUploadTask(t.Id)
                                                                                                }}/>
                                                                                                :
                                                                                                <Table.Operate image={Icons.uploaderCompleted}
                                                                                                               text="上传成功" onClick={()=>{}}
                                                                                                               style={{color:'#79e289'}}
                                                                                                />
                                                                                        )
                                                                                        :
                                                                                        <ProgressBar isCompleted={!t.isLoading}/>


                                                                                }
                                                                            </td>
                                                                        </tr>:
                                                                        (ii+1<d.skip?
                                                                            <tr>
                                                                                <td style={style} rowSpan={d.same}>
                                                                                    {
                                                                                        d.MeterType
                                                                                    }
                                                                                </td>
                                                                                <td style={{color:d.IsOnline<1?'red':'#000000'}}
                                                                                    rowSpan={d.same}>
                                                                                    {isOnline(d.IsOnline)}
                                                                                </td>
                                                                                <td rowSpan={d.same}>
                                                                                    {d.CurrentPower?d.CurrentPower.toFixed(2):'--'}
                                                                                </td>
                                                                                <td>
                                                                                    {
                                                                                        !t.isLoading?
                                                                                            (!t.isSuccess?
                                                                                                    <Table.Operate image={Icons.uploaderNow}
                                                                                                                   text="上传" onClick={()=>{
                                                                                                        d.IsOnline&&this.createUploadTask(t.Id)
                                                                                                    }}/>
                                                                                                    :
                                                                                                    <Table.Operate image={Icons.uploaderCompleted}
                                                                                                                   text="上传成功" onClick={()=>{}}
                                                                                                                   style={{color:'#79e289'}}
                                                                                                    />
                                                                                            )
                                                                                            :
                                                                                            <ProgressBar isCompleted={!t.isLoading}/>


                                                                                    }
                                                                                </td>
                                                                            </tr>:<tr>
                                                                                <td>
                                                                                    {
                                                                                        !t.isLoading?
                                                                                            (!t.isSuccess?
                                                                                                    <Table.Operate image={Icons.uploaderNow}
                                                                                                                   text="上传" onClick={()=>{
                                                                                                        d.IsOnline&&this.createUploadTask(t.Id)
                                                                                                    }}/>
                                                                                                    :
                                                                                                    <Table.Operate image={Icons.uploaderCompleted}
                                                                                                                   text="上传成功" onClick={()=>{}}
                                                                                                                   style={{color:'#79e289'}}
                                                                                                    />
                                                                                            )
                                                                                            :
                                                                                            <ProgressBar isCompleted={!t.isLoading}/>


                                                                                    }
                                                                                </td>
                                                                            </tr>)
                                                                        );
                                                                break
                                                            case staticType.capacityType.switch:
                                                                return(ii ===0 ?<tr>
                                                                        <td rowSpan={t.DeviceCapacities.length} className="text-left">
                                                                            <Checkbox checked={t.Checked} onClick={()=>this.toggleCheckState(t)}/>
                                                                            {i+1}
                                                                        </td>
                                                                        <td rowSpan={t.DeviceCapacities.length}>{t.Sn}</td>
                                                                        <td rowSpan={t.DeviceCapacities.length}>{t.Nick}</td>
                                                                        <td style={style} rowSpan={d.same}>
                                                                            {
                                                                                d.MeterType
                                                                            }
                                                                        </td>
                                                                        <td style={{color:d.IsOnline<1?'red':'#000000'}}
                                                                            rowSpan={d.same}>
                                                                            {isOnline(d.IsOnline)}
                                                                        </td>
                                                                        <td rowSpan={d.same}>
                                                                            {d.CurrentPower?d.CurrentPower.toFixed(2):'--'}
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                <Switch status={d.PowerOn?1:0} style={{left:'50%',marginLeft:'-24px'}}
                                                                                        changeStatus={()=>{d.IsOnline&&this.switchHandle([t.Id], d.PowerOn,d.Type)}}/>

                                                                            }
                                                                        </td>
                                                                    </tr>:
                                                                    (ii+1<d.skip?
                                                                        <tr>
                                                                            <td style={style} rowSpan={d.same}>
                                                                                {
                                                                                    d.MeterType
                                                                                }
                                                                            </td>
                                                                            <td style={{color:d.IsOnline<1?'red':'#000000'}}
                                                                                rowSpan={d.same}>
                                                                                {isOnline(d.IsOnline)}
                                                                            </td>
                                                                            <td rowSpan={d.same}>
                                                                                {d.CurrentPower?d.CurrentPower.toFixed(2):'--'}
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    <Switch status={d.PowerOn?1:0} style={{left:'50%',marginLeft:'-24px'}}
                                                                                            changeStatus={()=>{d.IsOnline&&this.switchHandle([t.Id], d.PowerOn,d.Type)}}/>


                                                                                }
                                                                            </td>
                                                                        </tr>:
                                                                        <tr>
                                                                            <td>
                                                                                {
                                                                                    <Switch status={d.PowerOn?1:0} style={{left:'50%',marginLeft:'-24px'}}
                                                                                            changeStatus={()=>{d.IsOnline&&this.switchHandle([t.Id], d.PowerOn, d.Type)}}/>

                                                                                }
                                                                            </td>
                                                                        </tr>)
                                                                   );
                                                                break
                                                            case staticType.capacityType.control:
                                                                return(ii === 0?
                                                                    <tr>
                                                                        <td rowSpan={t.DeviceCapacities.length} className="text-left">
                                                                            <Checkbox checked={t.Checked} onClick={()=>this.toggleCheckState(t)}/>
                                                                            {i+1}
                                                                        </td>
                                                                        <td rowSpan={t.DeviceCapacities.length}>{t.Sn}</td>
                                                                        <td rowSpan={t.DeviceCapacities.length}>{t.Nick}</td>
                                                                        <td style={style} rowSpan={d.same}>
                                                                            {
                                                                                d.MeterType
                                                                            }
                                                                        </td>
                                                                        <td style={{color:d.IsOnline<1?'red':'#000000'}}
                                                                            rowSpan={d.same}>
                                                                            {isOnline(d.IsOnline)}
                                                                        </td>
                                                                        <td rowSpan={d.same}>
                                                                            {d.CurrentPower?d.CurrentPower.toFixed(2):'--'}
                                                                        </td>
                                                                        <td >
                                                                            {
                                                                                <Table.Operate image={Icons.control}
                                                                                               text="控制"
                                                                                               onClick={()=>{
                                                                                                   d.IsOnline&&this.setState(
                                                                                                       {isShowControl:true,
                                                                                                           currentId:t.Id,
                                                                                                           status:d.LastInst
                                                                                                       })}}/>

                                                                            }
                                                                        </td>
                                                                    </tr>:
                                                                        (ii+1<d.skip?
                                                                            <tr>
                                                                            <td style={style} rowSpan={d.same}>
                                                                                {
                                                                                    d.MeterType
                                                                                }
                                                                            </td>
                                                                            <td style={{color:d.IsOnline<1?'red':'#000000'}}
                                                                                rowSpan={d.same}>
                                                                                {isOnline(d.IsOnline)}
                                                                            </td>
                                                                            <td rowSpan={d.same}>
                                                                                {d.CurrentPower?d.CurrentPower.toFixed(2):'--'}
                                                                            </td>
                                                                            <td>
                                                                                {
                                                                                    <Table.Operate image={Icons.control}
                                                                                                   text="控制"
                                                                                                   onClick={()=>{
                                                                                                       d.IsOnline&&
                                                                                                       this.setState({
                                                                                                           isShowControl:true,
                                                                                                           currentId:t.Id,
                                                                                                           status:d.LastInst})}}
                                                                                    />

                                                                                }
                                                                            </td>
                                                                        </tr>:<tr>

                                                                <td>
                                                                    {
                                                                        <Table.Operate image={Icons.control}
                                                                                       text="控制"
                                                                                       onClick={()=>{
                                                                                           d.IsOnline&&
                                                                                           this.setState({
                                                                                               isShowControl:true,
                                                                                               currentId:t.Id,
                                                                                               status:d.LastInst})}}
                                                                        />

                                                                    }
                                                                </td>
                                                            </tr>)
                                                                    );
                                                                break

                                                        }
                                                    }))

                                                })
                                            }
                                        </Table.Body>
                                    </Table>
                                    {(!deviceList || !deviceList.length) && <h5 className="text-center">未查询或没有查询到结果</h5>}

                                </div>
                                
                                <div style={{position: 'absolute',right: 20,top: 3,height: 36,width: 250,display:'flex',justifyContent:'space-between',zIndex:1}}>
                                    <Button type="outline"
                                            hasAddOn={true}
                                            onClick={()=>{ this.showBatchModal(true)}}
                                            style={{border:'0',backgroundColor: '#FFE4AA'}}
                                    >
                                        <Button.AddOn style={{height:12,width:12,marginTop: -5}} src={Icons.batchOpen}
                                        />
                                        批量开启
                                    </Button>

                                    <Button type="outline"
                                            hasAddOn={true}
                                            onClick={()=>this.showBatchModal(false)}
                                            style={{border:'0',backgroundColor: '#FFE4AA'}}
                                    >
                                        <Button.AddOn style={{height:12,width:12,marginTop: -5}} src={Icons.batchClose}
                                        />
                                        批量关闭
                                    </Button>
                                </div>
                            </div>
                        }
                        

                        
                    </PanelTable>
                    <br/>


                </div>
            </div>
            {

                isShowControl&&<ControlModal ids={[this.state.currentId]} status={status} onChange={(e)=>this.onChangeStatus(e)}
                                             hideEditModal={()=>this.setState({isShowControl:false})}/>
            }
            {
                isShowBatchModal&&<BatchModal list = {deviceList} batchOpen={batchOpen}
                                              createUploadTask ={(id)=>this.createUploadTask(id)}
                                              switchHandle={(id,status,type)=>this.switchHandle(id,status,type)}
                                              showControl = {(id,status)=>this.controlCondition(id,status)}
                                              hideEditModal={()=>this.setState({isShowBatchModal:false})}/>
            }
        </div>


        )
    }
}



module.exports = List;
