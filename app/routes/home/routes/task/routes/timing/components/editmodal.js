/**
 * Created by 栗子哥哥 on 2017/4/13.
 */

import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'redux-components/rmodal'
import Table from 'table'
import moment from 'moment'
import {Input} from 'redux-components/formcontrol'
import apis from 'apis'
import PanelTable from 'redux-components/paneltable'
import Button from 'button'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
import {TreeList,Tree} from 'redux-components/treeList'
import Promise from 'bluebird'
import './../../style.scss'
import Icons from 'icons'
import * as staticType from 'utils/staticType'
import DeviceListBar from  'redux-components/device-list-bar'
import ChooseBar from  'redux-components/choose-bar'
import auth from 'auth'

export default class EditModal extends BaseComponent {
    constructor(props){
        super(...arguments);
        let hourOption =[],minuteOption=[];
        for(let i = 0;i<60;i++) {
            
            if (i < 24) {
                if(i<10){
                    hourOption.push({name: '0'+i+'时', value: i})
                    minuteOption.push({name: '0'+i+'分', value: i})
                }else{
                    hourOption.push({name: i+'时', value: i})
                    minuteOption.push({name: i+'分', value: i}) 
                }
                
            }else{
                minuteOption.push({name: i+'分', value: i})
            }
        }
        hourOption.push({name:'时间',value:'时间'});
        minuteOption.push({name:'时间',value:'时间'});
        
        
        let selectStates = new SelectState([
            ['devicesType',{options:[{name:'空调',value:2},{name:'照明',value:1}],value:2,allowEmpty:false,placeholder:'全部'}],
            ['openHour',{options:hourOption,value:0,allowEmpty:false,placeholder:'时间'}],
            ['openMinute',{options:minuteOption,value:0,allowEmpty:false,placeholder:'时间'}],
            ['offHour',{options:hourOption,value:0,allowEmpty:false,placeholder:'时间'}],
            ['offMinute',{options:minuteOption,value:0,allowEmpty:false,placeholder:'时间'}]
        ]);
        this.state={
            editableData:this.getEditableData(),
            isSave:false,
            selectStates:selectStates,
            treeData:null,
            groupId:props.id,
            taskId: props.taskId,
            currentGroupId:[],
            isShow:false,
            isLoadingDeviceList: false,
            deviceList:[],
            isLoadingGroup:false,
            isLoadingSingleTask:false,
            userId:'',
            userInfo:auth.getUser(),

        }
    }
    handleTreeList(item){
        let data = this.state.treeData;
        data = Tree.setShow(item,data);
        this.setState({treeData:data})
    }
    taskSetSelectState(type,obj,cb) {
       
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
    /*获取数据*/
    getInitData(id){
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
                },()=>this.getEditData(this.state.taskId))
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
    getEditableData(user){
        if (user) {
            return {
                DevicesType:'',
                Name: '',
                OpenTime: '',
                OffTime: '',
                Groups: [],
                Status: staticType.taskStatusType.active
            }
        }
        else {
            return {
                DevicesType:'',
                Name: '',
                OpenTime: '',
                OffTime: '',
                Groups: [],
                Status: staticType.taskStatusType.active
            }
        }
    }
    /**
     * 保存添加更改
     */
    savingAdd() {
        let {editableData,isSave,selectStates,deviceList,taskId} = this.state;
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day  = now.getDate();
        let startTime='',endTime='';
        if(selectStates.getSelect('openHour').value ||selectStates.getSelect('openMinute').value){
            startTime =moment(new Date(year,month,day,selectStates.getSelect('openHour').value,selectStates.getSelect('openMinute').value)).format('YYYY-MM-DD HH:mm:ss')
        }
        if(selectStates.getSelect('offHour').value ||selectStates.getSelect('offMinute').value){
            endTime =moment(new Date(year,month,day,selectStates.getSelect('offHour').value,selectStates.getSelect('offMinute').value)).format('YYYY-MM-DD HH:mm:ss')
        }
        //提取选择设备
        let deviceIds =[];
        deviceList.length&&deviceList.map(d=>{
            if(d.checked){
                deviceIds.push(d.Id)
            }
        });
        //验证
        if(!editableData.Name){
            alert('请输入定时名称')
        }else if(deviceIds.length == 0){
            alert('请选择设备')
        }else{
            let postData={
                Id:taskId,
                Name:editableData.Name,
                TaskType:0,
                TaskState:editableData.Status,
                DeviceIds:deviceIds,
                TimingParam:{
                    StartTime:startTime,
                    EndTime: endTime,
                    CapacityType: selectStates.getSelect('devicesType').value
                }
            }
            this.taskAddRP && this.taskAddRP.request.abort();
            this.setState({isSave:false});
            this.taskAddRP = apis.task.modifyTask(postData);
            this.registerRequest(this.taskAddRP.request);
            this.taskAddRP.promise
                .then((res)=> {
                    this.setState({
                        isSave: true
                    });
                    this.handleClose();
                    this.props.search();
                })
                .catch((err)=> {
                    if (!err.abort) {
                        alert(err.msg);
                        this.setState({
                            isSave: true
                        });
                    }
                })
        }
       
    }
    
    /**
     * 获取设备列表
     */
    getDevicesList(data,id){
        let {currentGroupId,selectStates} = this.state
        this.deviceListRP && this.deviceListRP.request.abort();
        this.setState({
            isLoadingDeviceList:true,
            deviceList:[]
        })
        this.deviceListRP = apis.device.getDeviceList('' ,id || currentGroupId,'',selectStates.getSelect('devicesType').value);
        this.registerRequest(this.deviceListRP.request);
        this.deviceListRP.promise
            .then(res =>{
                let deviceList = res.Data;
                if(data) {
                    data.length && deviceList.map((item, index)=> {
                        data.map(m=> {
                            if (item.Id == m.Id) {
                                item.checked = true;
                                item.IsValid = m.IsValid;
                            }
                        })
                    });
                }
                this.setState({
                    deviceList:deviceList,
                    isLoadingDeviceList:false
                })
            })
            .catch(err => {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        deviceList: [],
                        isLoadingDeviceList:false
                    });
                }
            })
    }
    
    getEditData(id){
        this.getSingleTaskRP && this.getSingleTaskRP.request.abort();
        this.setState({
            isLoadingSingleTask:true,
        });
        this.getSingleTaskRP = apis.task.getSingleTask(id);
        this.registerRequest(this.getSingleTaskRP.request);
        this.getSingleTaskRP.promise
            .then((res)=> {
                let data = res.Data;
                this.setState({
                    isLoadingSingleTask:false,
                    userId: data.UserId
                },()=>this.handleData(data))
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingSingleTask:false
                    })

                }
            })
    }

    handleData(data){
        let deviceIds = data.Devices || [];
        this.taskSetSelectState('devicesType',{
            value: data.TimingParam.CapacityType
        },()=>this.getDevicesList(deviceIds));
        this.handleEditableDataChange('Name',data.Name);
        let openHour = parseInt(moment(new Date(data.TimingParam.StartTime)).format('HH'));
        let openMinute = parseInt(moment(new Date(data.TimingParam.StartTime)).format('mm'));
        let offHour = parseInt(moment(new Date(data.TimingParam.EndTime)).format('HH'));
        let offMinute = parseInt(moment(new Date(data.TimingParam.EndTime)).format('mm'));

        this.taskSetSelectState('openHour',{
            value: openHour
        });
        this.taskSetSelectState('openMinute',{
            value: openMinute,
        });
        this.taskSetSelectState('offHour',{
            value: offHour
        });
        this.taskSetSelectState('offMinute',{
            value: offMinute
        });
        this.handleEditableDataChange('Status',data.TaskState);
    }
    
    
    componentWillMount(){
        const openAnimation = ()=>this.setState({isShow:true});
        setTimeout(openAnimation,0);
        this.getInitData(this.state.groupId)
       
    }
    /**
     * 输入框改变
     */
    handleEditableDataChange(key, value) {
        let {editableData} = this.state;
        editableData[key] = value;
        this.setState({
            editableData: editableData
        });
    }
    handleClose() {
        this.setState({
            isShow: false
        });
        setTimeout(this.props.hideEditModal,300);
    }
    render(){
        const {editableData,isLoadingUserDetailFailed,loadingFailedText,isShow,deviceList,isLoadingDeviceList,
            isLoadingUserDetail,selectStates,treeData,isLoadingGroup,currentGroupId,userId,userInfo} = this.state;
        return(
            <Modal width="950" height="480" show={isShow} onClick={()=>this.taskSetSelectState(null,{open:false})}>
                <Modal.Header text="编辑任务" onClose={()=>this.handleClose()}/>

                <Modal.Content isLoading={isLoadingUserDetail}
                               loadingText="正在获取详情"
                               isLoadingFailed={isLoadingUserDetailFailed}
                               loadingFailedText={loadingFailedText}
                >

                    <div className="modal-line">
                        <div className="modal-line-left">定时对象</div>
                        <div className="modal-line-select">
                            <MySelect onChange={(obj)=>this.taskSetSelectState('devicesType',obj)}
                                {...selectStates.getSelect('devicesType')}  style={{width:'150px',height:'30px'}}
                            >
                                {selectStates.getSelect('devicesType').open&&
                                <SelectList {...selectStates.getSelect('devicesType')}
                                    onChange={(obj,cb)=>{this.taskSetSelectState('devicesType',obj,cb);this.getDevicesList();
                                                        this.handleEditableDataChange('DevicesType',obj.value)}}
                                />}
                            </MySelect>
                        </div>
                        <div className="modal-line-left">定时名称</div>
                        <div className="modal-line-input">
                            <Input size="thin" block={true}>
                                <input value={editableData.Name}
                                       onChange={(e)=>this.handleEditableDataChange('Name',e.target.value)}
                                />
                            </Input>
                        </div>
                    </div>
                    
                    
                    <div className="modal-line">
                        <div className="modal-line-left">定时开</div>
                        <div className="modal-line-select">
                            <MySelect onChange={(obj)=>this.taskSetSelectState('openHour',obj)} little={true}
                                {...selectStates.getSelect('openHour')} style={{width:'70px',height:'30px',marginRight:'10px'}}
                            >
                                {selectStates.getSelect('openHour').open&&
                                <SelectList {...selectStates.getSelect('openHour')}
                                    onChange={(obj,cb)=>{this.taskSetSelectState('openHour',obj,cb)}}
                                />}
                            </MySelect>

                            <MySelect onChange={(obj)=>this.taskSetSelectState('openMinute',obj)} little={true}
                                {...selectStates.getSelect('openMinute')} style={{width:'70px',height:'30px'}}
                            >
                                {selectStates.getSelect('openMinute').open&&
                                <SelectList {...selectStates.getSelect('openMinute')}
                                    onChange={(obj,cb)=>{this.taskSetSelectState('openMinute',obj,cb)}}
                                />}
                            </MySelect>
                        </div>
                        <div className="modal-line-left">定时关</div>
                        <div className="modal-line-select">
                            <MySelect onChange={(obj)=>this.taskSetSelectState('offHour',obj)} little={true}
                                {...selectStates.getSelect('offHour')} style={{width:'70px',height:'30px',marginRight:'10px'}}
                            >
                                {selectStates.getSelect('offHour').open&&
                                <SelectList {...selectStates.getSelect('offHour')}
                                    onChange={(obj,cb)=>{this.taskSetSelectState('offHour',obj,cb)}}
                                />}
                            </MySelect>

                            <MySelect onChange={(obj)=>this.taskSetSelectState('offMinute',obj)} little={true}
                                {...selectStates.getSelect('offMinute')} style={{width:'70px',height:'30px'}}
                            >

                                {selectStates.getSelect('offMinute').open&&
                                <SelectList {...selectStates.getSelect('offMinute')}
                                    onChange={(obj,cb)=>{this.taskSetSelectState('offMinute',obj,cb)}}
                                />}
                            </MySelect>  
                        </div>
                    </div>


                    <div className="modal-line content">
                        <div className="modal-line-left">选择设备</div>
                        <div className="modal-line-content">
                            <PanelTable text="选择区域"
                                        align="left"
                                        isLoading={isLoadingGroup}
                                        loadingText="正在获取数据"
                            >
                                <div style={{height:'166px',overflow:'hidden',overflowX:'auto',overflowY:'auto'}}>
                                    <TreeList data={treeData} onClick={(item)=>{this.handleTreeList(item)}}
                                              handleCheck={(val)=>this.setState({currentGroupId:val},()=>this.getDevicesList())}
                                              value={currentGroupId} />
                                </div>
                            </PanelTable>
                        </div>
                        <div className="modal-line-content">
                            <PanelTable text="选择设备"
                                        align="left"
                                        isLoading={isLoadingGroup}
                                        loadingText="正在获取数据"
                            >
                                <div  style={{height:'166px',overflow:'hidden',overflowX:'auto',overflowY:'auto'}}>
                                    <DeviceListBar data={deviceList} modal={true} isLoading={isLoadingDeviceList}
                                                   onChange={(list)=>this.setState({deviceList:list})}
                                                   isAllSelect={true} isModal={true}
                                    />

                                </div>

                            </PanelTable>
                        </div>
                        <div className="modal-line-content">
                            <PanelTable text="已选设备"
                                        align="left"
                                        isLoading={isLoadingGroup}
                                        loadingText="正在获取数据"
                            >
                                <div style={{height:'166px',overflow:'hidden',overflowX:'auto',overflowY:'auto'}}>
                                    <ChooseBar data={deviceList} modal={true} isLoading={isLoadingDeviceList} onChange={(list)=>this.setState({deviceList:list})}
                                    />
                                </div>
                            </PanelTable>
                        </div>
                    </div>
                    <div className="modal-line">
                        <div className="modal-line-left">定时状态</div>
                        <div className="modal-line-status">
                            
                            <Table.Operate image={editableData.Status==staticType.taskStatusType.active?Icons.choose:Icons.unChoose} text="激活"
                                           onClick={()=>this.handleEditableDataChange('Status',staticType.taskStatusType.active)}
                            />
                            <Table.Operate image={editableData.Status ==staticType.taskStatusType.off?Icons.choose:Icons.unChoose} text="关闭"
                                           onClick={()=>this.handleEditableDataChange('Status',staticType.taskStatusType.off)}
                            />
                        </div>
                    </div>

                    <div className="text-center">
                        <Button size="thin" type="outline" style={{width:100,marginRight:24,height:32,}}
                                onClick={()=>this.handleClose()}>取消
                        </Button>
                        <Button size="thin" disabled={userId!==userInfo.Id} style={userId!==userInfo.Id?{width:100,backgroundColor:'#dfdfdf'}:{width:100}}
                                onClick={()=>{this.savingAdd()}}>保存
                        </Button>
                    </div>
                </Modal.Content>

            </Modal>
        )
    }
}