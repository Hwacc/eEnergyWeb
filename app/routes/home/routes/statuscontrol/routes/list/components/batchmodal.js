/**
 * 创建于：2016-6-13
 * 创建人：杨骐彰
 * 说明： 添加分组模态框
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'redux-components/rmodal'
import PanelTable from 'redux-components/paneltable'
import Table from 'redux-components/table'
import Button from 'redux-components/button'
import Checkbox from 'redux-components/checkbox'
import Pagination from 'redux-components/pagination'
import {Input} from 'redux-components/formcontrol'
import apis from 'apis'
import auth from 'auth'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
import * as staticType from 'utils/staticType'
import Icons from 'icons'


export default class BatchModal extends BaseComponent {
    constructor(props) {
        let batchList =props.list.filter(i=>{
           return i.Checked ==true;
        });
        super(...arguments);
        this.state = {
            isShow: false,
            //添加分组是否正在加载设备列表
            isLoadingDevices: false,
            //添加分组设备列表
            deviceList: batchList,
            //添加当前分组设备列表是否被全选
            allSelect: true,
            //分页参数
            pageParams: {
                current: 1,
                total: 0
            },
            devicePower: staticType.capacityType.control,


        };
        //添加分组被选中的设备id列表
        this.selectDeviceIds = [];
        this.pageSize = 10;
    }
    groupAddSetSelectState(type,obj,cb) {
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
    componentWillMount(){
        const openAnimation = ()=>this.setState({isShow:true});
        setTimeout(openAnimation,0);

    }


    handleBatchControl(){
        
        let {deviceList,devicePower} = this.state;
        
        let status=this.props.batchOpen;
        let checkIds = [];
        deviceList.length&&deviceList.map((t,i)=>{
            let deviceCapacities = t.DeviceCapacities; 
            if(t.Checked){
                deviceCapacities.map((d,ii)=>{
                    if(d.Type ==devicePower){
                        checkIds.push(t.Id) 
                    }
                })
            }
        });
        this.handleClose();
        if(devicePower ==staticType.capacityType.measure){
            console.log('计量先等等')
        }else if(devicePower ==staticType.capacityType.switch){
            this.props.switchHandle(checkIds,!status,devicePower)
            
        }else{
            this.props.showControl(checkIds,status)
        }
        

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
     * 处理关闭
     */
    handleClose() {
        this.setState({
            isShow: false
        });
        setTimeout(this.props.hideEditModal,300);
    }

    render() {
        const {isShow,deviceList,allSelect,pageParams,devicePower} = this.state;
        const {batchOpen} = this.props;
        let num = 0;
        return (
            <Modal width="680" show={isShow}>
                <Modal.Header text={batchOpen?"批量开启":"批量关闭"} onClose={()=>this.handleClose()}/>
                <Modal.Content style={{height:500,overflowY:'auto'}}
                >
                    <Table>
                        <Table.Body>
                        <tr>
                            <td style={{width:180,border:'none',display:'flex',justifyContent:'space-around'}}>
                                <Table.Operate image={devicePower==staticType.capacityType.control?Icons.choose:Icons.unChoose}text="红外"
                                               onClick={()=>this.setState({devicePower:staticType.capacityType.control})}/>
                                <Table.Operate image={devicePower==staticType.capacityType.switch?Icons.choose:Icons.unChoose} text="开关"
                                               onClick={()=>this.setState({devicePower:staticType.capacityType.switch})}
                                />
                                
                            </td>
                            <td style={{border:'none'}}> </td>
                        </tr>
                            </Table.Body>

                    </Table>
                    
                    <PanelTable text="设备列表"
                                align="center"
                                isLoading={false}
                                loadingText="正在获取设备列表信息"
                    >
                        <div className="table-need-head">
                            <Table>
                                <thead>
                                <tr>
                                    <th className="text-left">
                                        <Checkbox checked={allSelect} onClick={()=>this.toggleAllSelect()}/>序号
                                    </th>
                                    <th>
                                        设备编码
                                    </th>
                                    <th>
                                        设备名称
                                    </th>
                                    <th>计量仪器</th>


                                </tr>
                                </thead>
                                <Table.Body>
                                    {
                                        deviceList && deviceList.map((t, i)=> {
                                            let deviceCapacities = t.DeviceCapacities;
                                            return(
                                                deviceCapacities.map((d,ii)=> {
                                                    if (d.Type == devicePower) {
                                                        return (
                                                            <tr>
                                                                <td className="text-left">
                                                                    <Checkbox checked={t.Checked}
                                                                              onClick={()=>this.toggleCheckState(t)}/>
                                                                </td>
                                                                <td >{t.Sn}</td>
                                                                <td >{t.Nick}</td>
                                                                <td >
                                                                    {
                                                                        d.MeterType
                                                                    }
                                                                </td>
                                                            </tr>
                                                        );
                                                    }

                                                })
                                            )

                                        })
                                    }
                                </Table.Body>
                            </Table>
                        </div>
                        <div className="table-need-body">
                            <Table>
                                <thead>
                                <tr>
                                    <th className="text-left">
                                        <Checkbox checked={allSelect} onClick={()=>this.toggleAllSelect()}/>序号
                                    </th>
                                    <th>
                                        设备编码
                                    </th>
                                    <th>
                                        设备名称
                                    </th>
                                    <th>计量仪器</th>

                                </tr>
                                </thead>
                                <Table.Body>
                                    {
                                        deviceList && deviceList.map((t, i)=> {
                                            let deviceCapacities = t.DeviceCapacities;
                                            return(
                                                deviceCapacities.map((d,ii)=> {
                                                    if (d.Type == devicePower) {
                                                        num++;
                                                        return (
                                                            <tr>
                                                                <td className="text-left">
                                                                    <Checkbox checked={t.Checked}
                                                                              onClick={()=>this.toggleCheckState(t)}/>
                                                                    {num}
                                                                </td>
                                                                <td >{t.Sn}</td>
                                                                <td >{t.Nick}</td>
                                                                <td >
                                                                    {
                                                                        d.MeterType
                                                                    }
                                                                </td>
                                                            </tr>
                                                        );
                                                    }

                                                })
                                            )

                                        })
                                    }
                                </Table.Body>
                            </Table>
                            {(!deviceList || !deviceList.length) && <h5 className="text-center">未查询或没有查询到结果</h5>}
                        </div> 
                           
                    </PanelTable>

                </Modal.Content>
                <Modal.Footer>
                    <Button size="thin" type="outline" onClick={()=>this.handleClose()}>
                        取消
                    </Button>
                    <Button size="thin" onClick={()=>this.handleBatchControl()}>
                        确定
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}
