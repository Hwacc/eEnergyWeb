/**
 * Created by whj on 2016/7/2.
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'redux-components/rmodal'
import Table from 'redux-components/table'
import {Input} from 'redux-components/formcontrol'
import apis from 'apis'
import Button from 'redux-components/button'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
export default class EditModal extends BaseComponent{
    constructor(props){
        super(...arguments);
        let selectStates = new SelectState([
            ['devicesType',{options:props.typeList,allowEmpty:true,
                placeholder:'全部'}]
        ])
        this.state={
            editableData:this.getEditableData(),
            isSave:false,
            isLoadingDeviceDetail:false,
            isLoadingDeviceDetailFailed: false,
            loadingFailedText: null,
            deviceDetailInfo:null,
            selectStates:selectStates,
            isShow:false
        }
    }
    handleSelectState(type,obj,cb) {
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
    getEditableData(device) {
        if (device) {
            return {
                Sn: device.Sn || '',
                Address: device.Address || '',
                GroupIdNameMaps: device.GroupIdNameMaps || [],
                Id:device.Id|| '',
                Name: device.Name|| '',
                Nick: device.Nick||'',
                TypeName:device.TypeName|| '',
                UseName:device.UseName|| '',
                UseType:device.UseType|| '',
            }
        }
        //重置
        else {
            return {
                Sn:  '',
                Address:  '',
                GroupIdNameMaps:  [],
                Id: '',
                Name:  '',
                Nick:'' ,
                TypeName: '',
                UseName: '',
                UseType:'',
            }
        }
    }
    componentWillMount(){
        const openAnimation = ()=>this.setState({isShow:true});
        setTimeout(openAnimation,0);
        this.getDeviceDetail()
    }
    /**
     * 查询设备详情
     */
    getDeviceDetail() {
        let device = this.props.currentId
        this.deviceDetailRP && this.deviceDetailRP.request.abort();
        this.setState({
            isShowEditModal: true,
            isLoadingDeviceDetail: true,
            isLoadingDeviceDetailFailed: false,
            loadingFailedText: null
        });
        this.deviceDetailRP = apis.device.getDeviceDetailInfo(device.Id);
        this.registerRequest(this.deviceDetailRP.request);
        this.deviceDetailRP.promise
            .then((res)=> {
                this.setState({
                    isLoadingDeviceDetail: false,
                    deviceDetailInfo: res.Data,
                    editableData: this.getEditableData(res.Data),
                });
                this.handleSelectState('devicesType',{value:res.Data.UseType})
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
    /**
     * 保存更改
     */
    savingChange() {
        this.deviceSaveRP && this.deviceSaveRP.request.abort();
        const {deviceDetailInfo,editableData}=this.state;
        this.setState({
            isSavingChange: true
        });
        this.deviceSaveRP = apis.device.saveDeviceInfoChange(deviceDetailInfo.Id,
            Object.assign(deviceDetailInfo, editableData));
        this.registerRequest(this.deviceSaveRP.request);
        this.deviceSaveRP.promise
            .then((res)=> {
                this.setState({
                    isSavingChange: false
                });
                alert('修改成功')
                this.handleClose();
                this.props.search();
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
    handleEditableDataChange(key, value) {
        let {editableData} = this.state;
        if(key=='AuxiAdminPhone'){
            let trimValue = value.trim();
            if(trimValue==''){
                editableData[key] = [];
            }else {
                editableData[key]=trimValue.split(/，|,/)
            }
        }else {
            editableData[key] = value;
        }
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
        const {editableData,isLoadingDeviceDetailFailed,loadingFailedText,isLoadingDeviceDetail,
            isShow,selectStates} = this.state;
        const {hideEditModal}=this.props;
        return(
            <Modal width="380" show={isShow} onClick={()=>this.handleSelectState(null,{open:false})}>
                <Modal.Header text={"修改设备信息"} onClose={()=>{this.handleClose()}}/>
                <Modal.Content isLoading={isLoadingDeviceDetail}
                               loadingText="正在获取详情"
                               isLoadingFailed={isLoadingDeviceDetailFailed}
                               loadingFailedText={loadingFailedText}
                >
                    <Table align="left"
                           noborder={true}>
                        <Table.Body>
                            <tr>
                                <td>所属分类</td>
                                <td>
                                    <MySelect onChange={(obj)=>this.handleSelectState('devicesType',obj)}
                                              {...selectStates.getSelect('devicesType')} style={{width:'100%',height:'30px'}}>
                                        {selectStates.getSelect('devicesType').open&&
                                        <SelectList {...selectStates.getSelect('devicesType')}
                                                    onChange={(obj,cb)=>{this.handleSelectState('devicesType',obj,cb);
                                                        this.handleEditableDataChange('UseType',obj.value)}}
                                        />}
                                    </MySelect>
                                </td>
                            </tr>
                            <tr>
                                <td style={{width:"5em"}}>设备条码</td>
                                <td>
                                    <Input size="thin"
                                           block={true}
                                           disabled
                                    >
                                        <input
                                            value={editableData.Sn}
                                            onChange={(e)=>this.handleEditableDataChange('Sn',e.target.value)}
                                        />
                                    </Input>
                                </td>
                            </tr>
                            <tr>
                                <td>设备名称</td>
                                <td>
                                    <Input size="thin"
                                           block={true}
                                    >
                                        <input
                                            value={editableData.Name}
                                            onChange={(e)=>this.handleEditableDataChange('Name',e.target.value)}
                                        />
                                    </Input>
                                </td>
                            </tr>
                            <tr>
                                <td>设备昵称</td>
                                <td>
                                    <Input size="thin"
                                           block={true}
                                    >
                                        <input
                                            value={editableData.Nick}
                                            onChange={(e)=>this.handleEditableDataChange('Nick',e.target.value)}
                                        />
                                    </Input>
                                </td>
                            </tr>
                            <tr>
                                <td>详细地址</td>
                                <td>
                                    <Input size="thin"
                                           block={true}
                                           className="distanceX"
                                    >
                                        <input
                                            value={editableData.Address}
                                            onChange={(e)=>this.handleEditableDataChange('Address',e.target.value)}
                                            disabled
                                        />
                                    </Input>
                                </td>
                            </tr>
                            <tr>
                                <td>设备类型</td>
                                <td>
                                    <Input size="thin"
                                           block={true}
                                    >
                                        <input
                                            value={editableData.TypeName}
                                            disabled
                                            onChange={(e)=>this.handleEditableDataChange('TypeName',e.target.value)}
                                        />
                                    </Input>
                                </td>
                            </tr>
                            <tr>
                                <td>所属区域</td>
                                <td>
                                    <div style={{height:'167px',overflow: 'hidden',
                                        overflowY: 'auto'}}>

                                        <Table>
                                            <Table.Head titles={['区域名称','操作']}/>
                                            <Table.Body>
                                                {
                                                    editableData.GroupIdNameMaps&&
                                                    editableData.GroupIdNameMaps.map((i,key)=>{
                                                        return(
                                                            <tr key={key}>
                                                                <td>{i.Name}</td>
                                                                <td>
                                                                    <Table.Operate
                                                                        text="删除"
                                                                        onClick={()=>{
                                                                            let groupIdNameMaps = [];
                                                                            editableData.GroupIdNameMaps.map(item=>{
                                                                                if(item.Id!=i.Id){
                                                                                    groupIdNameMaps.push(item)
                                                                                }
                                                                            });
                                                                            this.handleEditableDataChange('GroupIdNameMaps',groupIdNameMaps)}}/>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </Table.Body>
                                        </Table>
                                    </div>
                                </td>
                            </tr>
                        </Table.Body>
                    </Table>
                    <div className="text-center">
                        <Button size="thin" type="outline" style={{width:100,marginRight:50}}
                                onClick={()=>{this.handleClose()}}>取消
                        </Button>
                        <Button size="thin" style={{width:100}} onClick={()=>{this.savingChange();}}>保存</Button>
                    </div>
                </Modal.Content>
            </Modal>
        )
    }
}