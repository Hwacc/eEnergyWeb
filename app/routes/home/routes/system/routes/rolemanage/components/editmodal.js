/**
 * Created by whj on 2016/6/21.
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'modal'
import Table from 'table'
import {Input} from 'formcontrol'
import apis from 'apis'
import Button from 'button'
export default class EditModal extends BaseComponent{
    constructor(props){
        super(...arguments);
        this.state={
            editableData:this.getEditableData(),
            isSave:false,
            isLoadingRoleDetail:false,
            isLoadingRoleDetailFailed: false,
            loadingFailedText: null,
            userDetailInfo:null,
        }
    }
    getEditableData(role) {
        if (role) {
            return {
                Name: role.Name || '',
                Brief: role.Brief || '',
            }
        }
        //重置
        else {
            return {
                Name: '',
                Brief: '',
            }
        }
    }
    componentWillMount  (){
        this.getRoleDetail()
    }
    getRoleDetail() {
        let id = this.props.id
        this.setState({
            isShowEditModal: true,
            isLoadingRoleDetail: true,
            roleDetailInfo: {},
            isLoadingRoleDetailFailed: false,
            loadingFailedText: null
        });
        this.roleDetailRP = apis.rolemanage.getRoleDetail(id);
        this.registerRequest(this.roleDetailRP.request);
        this.roleDetailRP.promise
            .then((res)=> {
                this.setState({
                    isLoadingRoleDetail: false,
                    roleDetailInfo: res.Data,
                    editableData: this.getEditableData(res.Data)
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    this.setState({
                        isLoadingRoleDetail: false,
                        isLoadingRoleDetailFailed: true,
                        loadingFailedText: err.msg
                    });
                }
            })
    }
    /**
     * 保存编辑更改
     */
    savingChange() {
        //保存添加角色
        /*        this.roleSaveRP && this.roleSaveRP.request.abort();
         const {roleDetailInfo,editableData}=this.state;
         this.setState({
         isSavingChange: true
         });
         let temp = editableData.Areas.map((item)=>{
         return {Id:item}
         });
         editableData.Areas = temp;
         this.roleSaveRP = apis.rolemanage.saveRoleDetail(roleDetailInfo.Id, Object.assign(roleDetailInfo, editableData));
         this.registerRequest(this.roleSaveRP.request);
         this.roleSaveRP.promise
         .then((res)=> {
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
         })*/
    }
    handleEditableDataChange(key, value) {
        let {editableData} = this.state;
        editableData[key] = value;
        this.setState({
            editableData: editableData
        });
    }
    render(){
        const {editableData,isLoadingRoleDetailFailed,loadingFailedText,isLoadingRoleDetail} = this.state;
        const {hideEditModal,search}=this.props
        return(
            <Modal width="450" show={true}>
                <Modal.Header text="修改角色信息" onClose={()=>hideEditModal()}/>

                <Modal.Content isLoading={isLoadingRoleDetail}
                               loadingText="正在获取详情"
                               isLoadingFailed={isLoadingRoleDetailFailed}
                               loadingFailedText={loadingFailedText}
                               style={{height:300,overflow:"auto"}}
                >
                    <Table align="left"
                           noborder={true}>
                        <Table.Body>
                            <tr>
                                <td style={{width:"5em"}}>角色名称</td>
                                <td>
                                    <Input size="thin"
                                           value={editableData.Name}
                                           block={true}
                                           onChange={(e)=>this.handleEditableDataChange('Name',e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>权限说明</td>
                                <td>
                                        <textarea
                                            style={{height:150,width:290,boxSizing:"border-box",border:"1px solid#52caff",borderRadius:4}}
                                            onChange={(e)=>this.handleEditableDataChange('Brief',e.target.text)}
                                            value={editableData["Brief"]}
                                        />
                                </td>
                            </tr>
                        </Table.Body>
                    </Table>
                    <p>
                    </p>
                    <div className="text-center">
                        <Button size="thin" type="outline" style={{width:100,marginRight:50}}
                                onClick={()=>hideEditModal()}>取消
                        </Button>
                        <Button size="thin" style={{width:100}} onClick={()=>{this.savingChange();}}>保存</Button>
                    </div>
                </Modal.Content>

            </Modal>
        )
    }
}