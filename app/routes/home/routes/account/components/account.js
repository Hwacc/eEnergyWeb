/**
 * Created by 栗子哥哥 on 2017/1/10.
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
import icons from 'icons'

class Account extends BaseComponent {
    constructor(props){
        super(...arguments);
        let editableData  = this.getEditableData(auth.getUser());
        this.state={
            isSave:false,
            isLoadingUserDetail:false,
            isLoadingUserDetailFailed: false,
            isShowModal: false,
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
        console.log(editableData);
        this.userSaveRP = apis.usermanage.saveUserDetail(userDetailInfo.Id, Object.assign(userDetailInfo, editableData));
        this.registerRequest(this.userSaveRP.request);
        this.userSaveRP.promise
            .then((res)=> {
                this.setState({
                    isSave: true
                });
                window.location.hash = 'login'
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

    hideEditModal(){
        this.setState({isShowModal: false})
    }
    render(){
        const {editableData,isLoadingUserDetailFailed,isLoadingUserDetail,isShowModal} = this.state;
        return(

            <div className ="sem-main-content" style={{backgroundColor:'#fff'}}>
                <div className= "header-icon" style = {{backgroundImage:`url(${icons.bgAccount})`}}>我的账号</div>
                <div className="account-table">
                    <Table align="right"
                        noborder={true}>
                        <Table.Body>
                            <tr>
                                <td>用户名：</td>
                                <td>
                                    <Input size="thin"
                                           disabled
                                           value={editableData.Username}
                                           block={true}
                                           onChange={(e)=>this.handleEditableDataChange('Username',e.target.value)}
                                    />
                                    
                                </td>
                            </tr>
                            <tr>
                                <td>角色：</td>
                                <td>
                                    <Input size="thin"
                                           disabled
                                           value={editableData.RoleName}
                                           block={true}
                                           onChange={(e)=>this.handleEditableDataChange('RoleName',e.target.value)}
                                    />
                                </td>
                            </tr>
                       
                            <tr>
                                <td>密码：</td>
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
                                <td>电话：</td>
                                <td>
                                    <Input size="thin"
                                           value={editableData.PhoneNo}
                                           block={true}
                                           onChange={(e)=>this.handleEditableDataChange('PhoneNo',e.target.value)}
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td>真实姓名：</td>
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
                        <Button size="thin" type="outline" style={{width:100,marginRight:24}} onClick={()=>window.location.hash = 'home/home'}>取消
                        </Button>
                        <Button size="thin" style={{width:100}} onClick={()=>{this.setState({isShowModal: true})}}>保存
                        </Button>
                    </div>
                </div>
                {
                    isShowModal&&<Modal width="350" height="480" show={true}>
                        <Modal.Header text="修改用户信息" onClose={()=>{this.hideEditModal()}}/>
                        <Modal.Content isLoading={isLoadingUserDetail}
                                       loadingText="正在获取详情"
                                       isLoadingFailed={isLoadingUserDetailFailed}
                        >
                            <div style={{textAlign:'center'}}>
                              <p style={{marginTop: 10,marginBottom: 10,fontSize:16}}>  确定修改用户信息?</p>

                            </div>
                            <div className="text-center">
                                <Button size="thin" type="outline" style={{width:100,marginRight:24}} onClick={()=>{this.hideEditModal()}}>取消
                                </Button>
                                <Button size="thin" style={{width:100}} onClick={()=>{this.savingChange()}}>确定
                                </Button>
                            </div>
                        </Modal.Content>
                    </Modal>
                } 
            </div>
     
        )
    }
}
module.exports = Account;