/**
 * Created by whj on 2016/7/2.
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'redux-components/rmodal'
import Table from 'redux-components/table'
import apis from 'apis'
import Button from 'redux-components/button'
export default class InfoModal extends BaseComponent{
    constructor(props){
        super(...arguments);
        this.state={
            editableData:this.getEditableData(),
            isSave:false,
            isLoadingDeviceDetail:false,
            isLoadingDeviceDetailFailed: false,
            loadingFailedText: null,
            deviceDetailInfo:null,
            isShow:false
        }
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
    componentWillMount  (){
        const openAnimation = ()=>this.setState({isShow:true});
        setTimeout(openAnimation,0);
        this.getDeviceDetail()
    }
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
                    address:{
                        provinceId:res.Data.ProvinceId,
                        cityId:res.Data.CityId,
                        districtId:res.Data.DistrictId,
                        communityId:res.Data.CommunityId
                    }
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
    handleClose() {
        this.setState({
            isShow: false
        });
        setTimeout(this.props.hideEditModal,300);
    }
    render(){
        const {editableData,isLoadingDeviceDetailFailed,loadingFailedText,isLoadingDeviceDetail,isShow} = this.state;
        const {hideEditModal,search}=this.props;
        return(
            <Modal width="380" show={isShow}>
                <Modal.Header text={"设备详情"} onClose={()=>{this.handleClose()}}/>
                <Modal.Content isLoading={isLoadingDeviceDetail}
                               loadingText="正在获取详情"
                               isLoadingFailed={isLoadingDeviceDetailFailed}
                               loadingFailedText={loadingFailedText}
                >
                    <Table align="left"
                           noborder={true}>
                        <Table.Body>
                            <tr>
                                <td style={{width:"5em"}}>所属分类</td>
                                <td>
                                    {editableData.TypeName}
                                </td>
                            </tr>
                            <tr>
                                <td>设备型号</td>
                                <td>
                                    {editableData.Sn}
                                </td>
                            </tr>
                            <tr>
                                <td>设备昵称</td>
                                <td>
                                    {editableData.Nick}
                                </td>
                            </tr>
                            <tr>
                                <td>设备地址</td>
                                <td>
                                    {editableData.Address}
                                </td>
                            </tr>
                            <tr>
                                <td>所在区域</td>
                                <td>
                                    {editableData.GroupIdNameMaps ? editableData.GroupIdNameMaps.map(i=>i.Name+',') : '无'}
                                </td>
                            </tr>
                            <tr>
                                <td>设备类型</td>
                                <td>
                                    {editableData.TypeName || '无'}

                                </td>
                            </tr>
                        </Table.Body>

                    </Table>
                    <p>
                    </p>
                    <div className="text-center">
                        <Button size="thin" style={{width:100}} onClick={()=>{this.handleClose()}}>确定</Button>
                    </div>
                </Modal.Content>
            </Modal>
        )
    }
}