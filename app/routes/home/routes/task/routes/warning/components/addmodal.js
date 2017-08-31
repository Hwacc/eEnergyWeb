/**
 * Created by 栗子哥哥 on 2017/4/13.
 */

import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'redux-components/rmodal'
import Table from 'table'
import moment from 'moment'
import {Input,TextArea} from 'redux-components/formcontrol'
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

export default class AddModal extends BaseComponent {
    constructor(props){
        super(...arguments);

        let hourOption =[],minuteOption=[];
        for(let i = 0;i<60;i++) {
            if(i<10){
                i="0"+i
            }
            if (i < 24) {
                hourOption.push({name: i+'时', value: i})
            }
            minuteOption.push({name: i+'分', value: i})
        }

        let selectStates = new SelectState([
            ['devicesType',{options:[{name:'空调开启预警',value:2},{name:'用电量预警',value:0}],value:(props.type ==0 || props.type)?props.type:2,allowEmpty:false,placeholder:'不限'}],
            ['openHour',{options:hourOption,allowEmpty:false,placeholder:'00时'}],
            ['openMinute',{options:minuteOption,allowEmpty:false,placeholder:'00分'}],
            ['offHour',{options:hourOption,allowEmpty:false,placeholder:'00时'}],
            ['offMinute',{options:minuteOption,allowEmpty:false,placeholder:'00分'}],
        ]);
        this.state={
            editableData:this.getEditableData(),
            isSave:false,
            selectStates:selectStates,
            treeData:null,
            groupId:props.id,
            currentGroupId:[],
            isShow:false,
            isLoadingDeviceList: false,
            deviceList:[],
            isLoadingGroup:false

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
                },()=>this.getDevicesList(id))
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
                Description:'',
                Alert: 0,
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
                Description:'',
                Alert: 0,
                Status: staticType.taskStatusType.active
            }
        }
    }
    /**
     * 保存添加更改
     */
    savingAdd() {
        let {editableData,isSave,selectStates,deviceList} = this.state;
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day  = now.getDate();
        editableData.OpenTime = new Date(year,month,day,selectStates.getSelect('openHour').value,selectStates.getSelect('openMinute').value)
        editableData.OffTime = new Date(year,month,day,selectStates.getSelect('offHour').value,selectStates.getSelect('offMinute').value)
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
                Name:editableData.Name,
                TaskType:1,
                TaskState:editableData.Status,
                DeviceIds:deviceIds,
                Description:editableData.Description,
                TimingParam:{
                    Alert: editableData.Alert,
                    StartTime:moment(editableData.OpenTime).format('YYYY-MM-DD HH:mm:ss'),
                    EndTime: moment(editableData.OffTime).format('YYYY-MM-DD HH:mm:ss'),
                    CapacityType: selectStates.getSelect('devicesType').value
                }
            }
            this.taskAddRP && this.taskAddRP.request.abort();
            this.setState({isSave:false});
            this.taskAddRP = apis.task.addTask(postData);
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
    getDevicesList(id){
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
                this.setState({
                    deviceList:res.Data,
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
            isLoadingUserDetail,selectStates,treeData,isLoadingGroup,currentGroupId} = this.state;
        const devicesType = selectStates.getSelect('devicesType').value

        return(
            <Modal width="950" height="550" show={isShow} onClick={()=>this.taskSetSelectState(null,{open:false})}>
                <Modal.Header text="新建任务" onClose={()=>this.handleClose()}/>

                <Modal.Content isLoading={isLoadingUserDetail}
                               loadingText="正在获取详情"
                               isLoadingFailed={isLoadingUserDetailFailed}
                               loadingFailedText={loadingFailedText}
                >

                    <div className="modal-line">
                        <div className="modal-line-left">预警类型</div>
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
                        <div className="modal-line-left">预警名称</div>
                        <div className="modal-line-input">
                            <Input size="thin" block={true}>
                                <input value={editableData.Name}
                                       onChange={(e)=>this.handleEditableDataChange('Name',e.target.value)}
                                />
                            </Input>
                        </div>
                    </div>

                    {
                        devicesType?
                            <div className="modal-line">
                                <div className="modal-line-left">预警时间段</div>
                                <div className="modal-line-select" style={{margin: 0}}>

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
                                <span style={{color: '#52caff',lineHeight:'30px',margin:'0px 15px'}}>—</span>
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
                            :
                            <div className="modal-line">
                                <div className="modal-line-left">设置预警值</div>
                                <div className="modal-line-input">
                                    <Input size="thin" block={true}>
                                        <input value={editableData.Alert}
                                               onChange={(e)=>this.handleEditableDataChange('Alert',parseInt(e.target.value))}
                                        />
                                    </Input>
                                </div>
                            </div>

                    }
                    <div className="modal-line note">
                        <div className="modal-line-left">备注</div>
                        <TextArea size="thin" block={true} className="modal-line-note">
                                <textarea  value={editableData.Description} style={{border:'none',height:70,width:410}}
                                           onChange={(e)=>this.handleEditableDataChange('Description',e.target.value)}/>
                            </TextArea>
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
                                        isLoading={isLoadingDeviceList}
                                        loadingText="正在获取数据"
                            >
                                <div  style={{height:'166px',overflow:'hidden',overflowX:'auto',overflowY:'auto'}}>
                                    <DeviceListBar data={deviceList}
                                                   isAllSelect={true} isModal={true}
                                                   isLoading={isLoadingDeviceList} 
                                                   onChange={(list)=>this.setState({deviceList:list})}/>
                                </div>

                            </PanelTable>
                        </div>
                        <div className="modal-line-content">
                            <PanelTable text="已选设备"
                                        align="left"
                                        isLoading={isLoadingDeviceList}
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
                        <div className="modal-line-left">预警状态</div>
                        <div className="modal-line-status">
                            <Table.Operate image={editableData.Status==staticType.taskStatusType.active?Icons.choose:Icons.unChoose}text="激活"
                                           onClick={()=>this.handleEditableDataChange('Status',staticType.taskStatusType.active)}
                            />
                            <Table.Operate image={editableData.Status ==staticType.taskStatusType.off?Icons.choose:Icons.unChoose} text="关闭"
                                           onClick={()=>this.handleEditableDataChange('Status',staticType.taskStatusType.off)}
                            />
                        </div>
                    </div>

                    <div className="text-center">
                        <Button size="thin" type="outline" style={{width:100,marginRight:50}}
                                onClick={()=>this.handleClose()}>取消
                        </Button>
                        <Button size="thin" style={{width:100}} onClick={()=>{this.savingAdd()}}>保存
                        </Button>
                    </div>
                </Modal.Content>

            </Modal>
        )
    }
}