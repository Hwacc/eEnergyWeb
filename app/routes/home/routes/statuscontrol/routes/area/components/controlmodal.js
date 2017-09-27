/**
 * Created by whj on 2016/6/27.
 * 单设备控制
 */
import React,{Component} from  'react'
import BaseComponent from 'basecomponent'
import Modal from 'modal'
import Table from 'table'
import apis from 'apis'
import Button from 'button'
import Switch from 'switch'
import Panel from 'settingpanel'

export default class ControlModal extends BaseComponent{
    constructor(props){
        super(...arguments);
        this.state={
            editableData:this.getEditableData(props.data),
            isSave:false,
            isLoading:false,
            isLoadingFailed:false,
            loadingFailedText:null,
            detailInfo:null,
            isShow:true,
        }

     
        
    }
    //初始化面板数据
    getEditableData(data){
        if (data) {
            let codeData;
            data.DeviceCapacities.some((d)=>{
                if(d.LastInst){
                    codeData = d.LastInst;
                    return true;
                }else{
                    this.getEditableData(null);
                }
            });
            let code = codeData.split('');
            return {
                switchs: code[0] || 0,
                typeControl: code[1] || 0,
                temperature: parseInt(code[2]+code[3])+16 || 16,
                windSpeed: code[4] || 0,
                windDirection:code[5] || 0
            }
        }
        //
        else {
            let now = new Date();
            let month = now.getMonth()+1;
            let initData = {
                summer:{
                    switchs:1,
                    typeControl:1,
                    temperature:26,
                    windSpeed:0,
                    windDirection:0
                },
                winter:{
                    switchs:1,
                    typeControl:2,
                    temperature:20,
                    windSpeed:0,
                    windDirection:0
                }
            };
            switch (true){
                case month>5&&month<10:
                    return initData.summer;
                    break;
                case month>10&&month<4:
                    return initData.winter;
                    break;
                default:
                    return{
                        switchs:1,
                        typeControl:0,
                        temperature:24,
                        windSpeed:0,
                        windDirection:0
                    };
            }
        }
    }
    //设备开关
    changeStatus(){
        let data = this.state.editableData;
        this.state.editableData.switchs==0?
            data.switchs=1:
            data.switchs = 0;
        this.setState({
            editableData:data
        })
    }
    //控制功能
    handleClick(value){
        let data = this.state.editableData;
        data.typeControl = value
        this.setState({
            editableData:data
        })
    }
    //增加温度
    handleAdd(){
        let value = this.state.editableData.temperature;
        if(value+1<33){
            value = value+ 1;
        }
        let data = this.state.editableData;
        data.temperature= value;
        this.setState({
            editableData:data
        })
    }
    //降低温度
    handleReduce(){
        let value = this.state.editableData.temperature;
        if(value-1>15){
            value = value-1
        }
        let data = this.state.editableData;
        data.temperature = value
        this.setState({
            editableData:data
        })
    }
    //控制风速
    handleSpeed(value){
        let data = this.state.editableData;
        data.windSpeed = value;
        this.setState({
            editableData:data
        })
    }
    //控制风向
    handleDirection(value){
        let data = this.state.editableData;
        data.windDirection = value
        this.setState({
            editableData:data
        })
    }
    //保存
    savingChange(){
        let data = this.state.editableData;
        let ids = this.props.ids;
        let temperature = data.temperature-16<16?'0'+(data.temperature-16).toString(16):(data.temperature-16).toString(16);
        let num = data.switchs.toString()+data.typeControl.toString()+
            temperature+data.windSpeed.toString()
            +data.windDirection.toString();
        let postData = {
            DeviceIds:[ids],
            ControlStr: num,
        };
        Modal.loading ("正在保存修改")
        this.deviceControlRP&&this.deviceControlRP.request.abort();
        this.deviceControlRP = apis.device.controlDevice(postData);
        this.deviceControlRP.promise
            .then(()=>{
                this.props.hideEditModal();
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
        const {editableData,isSave,isLoading,
            isLoadingFailed,loadingFailedText,detailInfo,isShow,powerStatus}=this.state
        const {hideEditModal,switchHandle} = this.props;


        let ids = this.props.ids;
        let temperature = editableData.temperature-16<16?'0'+(editableData.temperature-16).toString(16).toUpperCase()
            :(editableData.temperature-16).toString(16).toUpperCase();
        let num = editableData.switchs.toString()+editableData.typeControl.toString()+
            temperature+editableData.windSpeed.toString()
            +editableData.windDirection.toString()+'0';
        let postData = {
            DeviceIds:[ids],
            ControlStr: num,
        };

        return(
            <Modal show={isShow} >
                <Modal.Header text = "远程控制" onClose={hideEditModal}/>
                <Modal.Content>
                    <Table align="left"
                           noborder = {true}
                           >
                        <Table.Body>
                            <tr>
                                <td style={{width:80}}>空调开关</td>
                                <td><Switch status={editableData.switchs} changeStatus={this.changeStatus.bind(this)}/></td>
                            </tr>
                            <tr>
                                <td><Panel editableData={editableData} handleClick={this.handleClick.bind(this)}
                                           handleAdd={this.handleAdd.bind(this)} handleReduce={this.handleReduce.bind(this)}
                                           handleSpeed={this.handleSpeed.bind(this)} handleDirection={this.handleDirection.bind(this)}/>
                                </td>
                            </tr>
                        </Table.Body>
                        </Table>
                    <div className="text-left" style={{margin:'5px',display:'flex',justifyContent:'center'}}>
                        <Button size="thin" type="outline" style={{width:100,marginRight:50}}
                                onClick={hideEditModal}>取消
                        </Button>
                        <Button size="thin" style={{width:100}} onClick={()=>{switchHandle(ids,null,num,2)}}>保存</Button>
                    </div>

                </Modal.Content>

            </Modal>
        )

    }
}
