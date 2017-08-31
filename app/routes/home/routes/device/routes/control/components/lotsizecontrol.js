/**
 * Created by whj on 2016/6/27.
 * 说明：批量控制
 */
import React,{Component} from  'react'
import BaseComponent from 'basecomponent'
import Switch from 'switch'
import Modal from 'modal'
import Table from 'table'
import apis from 'apis'
import Button from 'button'

export default class LotSizeControl extends BaseComponent{
    constructor(props){
        super(...arguments);
        this.state={
            editableData:{
                switchs:1,//设备开关
                typeControl:0,//默认关闭
                temperature:24,//设置温度
                windSpeed:1,//设置风速
                windDirection:1,//设置风向
            },
        }
    }
    //控制设备开关
    changeStatus(){
        let data = this.state.editableData;
        this.state.editableData.switchs==0?
            data.switchs=1:
            data.switchs = 0;
        this.setState({
            editableData:data
        })
    }
    //保存
    savingChange(){
        let data = this.state.editableData;
        let sns = this.props.sns
        let temperature = data.temperature-16<16?'0'+(data.temperature-16).toString(16):(data.temperature-16).toString(16);
        let num = data.switchs.toString()+data.typeControl.toString()+
            temperature+data.windSpeed.toString()
            +data.windDirection.toString();
        let postData = {
            Ids:sns,
            ControlStr: num
        }
        Modal.loading("正在保存修改")
        this.deviceControlRP&&this.deviceControlRP.request.abort();
        this.deviceControlRP = apis.device.controlDevice(postData);
        this.deviceControlRP.promise
            .then(()=>{
                this.props.hideEditModal()
                alert('修改成功')
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
    render(){
        let {hideEditModal} = this.props;
        let {editableData} = this.state;
        return(
            <Modal width="620" show={true} >
                <Modal.Header text = "批量控制" onClose={hideEditModal}/>
                <Modal.Content >
                    <Table align="left"
                           noborder = {true}
                    >
                        <Table.Body>
                            <tr>
                                <td style={{width:80}}>空调开关</td>
                                <td><Switch status={editableData.switchs} changeStatus={this.changeStatus.bind(this)}/></td>
                            </tr>
                        </Table.Body>
                    </Table>
                    <div className="text-left" style={{marginTop:40,marginLeft:107}}>
                        <Button size="thin" type="outline" style={{width:100,marginRight:50}}
                                onClick={hideEditModal}>取消
                        </Button>
                        <Button size="thin" style={{width:100}} onClick={()=>{this.savingChange()}}>保存
                        </Button>
                    </div>

                </Modal.Content>

            </Modal>
        )
    }

}