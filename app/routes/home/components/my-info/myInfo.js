/**
 * Created by whj57 on 2016/12/30.
 */
/**
 * Created by whj on 2016/6/20.
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'modal'
import Table from 'table'
import {Input} from 'formcontrol'
import apis from 'apis'
import Button from 'button'
import {TreeList,Tree} from 'redux-components/treeList'
import auth from 'auth'
import {withRouter} from 'react-router'

 class EditModal extends BaseComponent {
    constructor(props){
        super(...arguments);
        let editableData  = this.getEditableData(auth.getUser());
        this.state={
            isSave:false,
            isLoadingUserDetail:false,
            isLoadingUserDetailFailed: false,
            loadingFailedText: null,
            treeData:null,
            currentGroupId:[],
            userDetailInfo:editableData,
            editableData: editableData
        }
    }


    //获取用户详细信息
    getEditableData(user){
        if (user) {
            return {
                Id:user.Id||'',
                Name: user.Name || '',
                PhoneNo: user.PhoneNo || '',
                RoleName: user.RoleName || '',
                Username: user.Username || '',
                RoleId:user.RoleId||''
            }
        }
        //重置
        else {
            return {
                Name: '',
                PhoneNo: '',
                RoleName: '',
                Username: '',
            }
        }
    }
    /**
     * 保存编辑更改
     */
    savingChange() {
        this.userSaveRP && this.userSaveRP.request.abort();
        const {userDetailInfo, editableData}=this.state;
        if(!editableData.Name.trim()){
            return alert('请输入真实姓名')
        }
        this.userSaveRP = apis.usermanage.saveUserDetail(userDetailInfo.Id, Object.assign(userDetailInfo, editableData));
        this.registerRequest(this.userSaveRP.request);
        this.userSaveRP.promise
            .then((res)=> {
                this.setState({
                    isSave: true
                });
                this.props.router.replace('login')
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
    render(){
        const {editableData,isLoadingUserDetailFailed,loadingFailedText,
            isLoadingUserDetail,treeData,currentGroupId} = this.state;
        let titleText = '';
        currentGroupId.map((i,index)=>{
            let searchName = '';
            treeData&&treeData.some(item=>{
                searchName = item.name;
                return item.value==i
            })
            if(index==currentGroupId.length){
                titleText=titleText+searchName
            }else {
                titleText=titleText+searchName+','
            }
        })
        return(
            <Modal width="350" height="480" show={true}>
                <Modal.Header text="修改用户信息" onClose={()=>{this.props.hideEditModal()}}/>
                <Modal.Content isLoading={isLoadingUserDetail}
                               loadingText="正在获取详情"
                               isLoadingFailed={isLoadingUserDetailFailed}
                               loadingFailedText={loadingFailedText}
                >
                    <Table align="left"
                           noborder={true}>
                        <Table.Body>
                            <tr>
                                <td>角色</td>
                                <td>
                                    <Input size="thin"
                                           disabled
                                           value={editableData.RoleName}
                                           block={true}
                                           onChange={(e)=>this.handleEditableDataChange('Username',e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>登录名</td>
                                <td>
                                    <Input size="thin"
                                           value={editableData.Username}
                                           block={true}
                                           onChange={(e)=>this.handleEditableDataChange('Username',e.target.value)}
                                    />
                                </td>

                            </tr>
                            <tr>
                                <td>密码</td>
                                <td>
                                    <Input size="thin"
                                           type="password"
                                           placeholder="请输入新密码"
                                           value={editableData.Password}
                                           block={true}
                                           onChange={(e)=>this.handleEditableDataChange('Password',e.target.value)}
                                    />
                                </td>

                            </tr>
                            <tr>
                                <td>电话</td>
                                <td>
                                    <Input size="thin"
                                           value={editableData.PhoneNo}
                                           block={true}
                                           onChange={(e)=>this.handleEditableDataChange('PhoneNo',e.target.value)}
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td>真实姓名</td>
                                <td>
                                    <Input size="thin"
                                           value={editableData.Name}
                                           block={true}
                                           onChange={(e)=>this.handleEditableDataChange('Name',e.target.value)}
                                    />
                                </td>
                            </tr>
                        </Table.Body>
                    </Table>
                    <p>
                    </p>
                    <div className="text-center">
                        <Button size="thin" type="outline" style={{width:100,marginRight:50}} onClick={()=>{this.props.hideEditModal()}}>取消
                        </Button>
                        <Button size="thin" style={{width:100}} onClick={()=>{this.savingChange()}}>保存
                        </Button>
                    </div>
                </Modal.Content>
            </Modal>
        )
    }
}
module.exports = withRouter(EditModal);
