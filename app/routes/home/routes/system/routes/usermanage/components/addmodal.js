/**
 * Created by whj on 2016/6/21.
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'redux-components/rmodal'
import Table from 'table'
import {Input} from 'redux-components/formcontrol'
import apis from 'apis'
import PanelTable from 'redux-components/paneltable'
import Button from 'button'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
import {TreeList,Tree} from 'redux-components/treeList'
import Promise from 'bluebird'
export default class AddModal extends BaseComponent {
    constructor(props){
        super(...arguments);
        let selectStates = new SelectState([
            ['role',{}]
        ]);
        this.state={
            editableData:this.getEditableData(),
            isSave:false,
            isLoadingUserDetail:false,
            isLoadingUserDetailFailed: false,
            loadingFailedText: null,
            userDetailInfo:null,
            selectStates:selectStates,
            treeData:null,
            groupId:props.id,
            currentGroupId:[],
            isShow:false
        }
    }
    handleTreeList(item){
        let data = this.state.treeData;
        data = Tree.setShow(item,data);
        this.setState({treeData:data})
    }

    userSetSelectState(type,obj,cb) {
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
        if (!id && id == 0)return;
        this.groupRP = apis.group.getGroupListByCommunityID();
        this.roleRP = apis.rolemanage.roleList();
        let {selectStates} = this.state
        this.userSetSelectState('role',{
            isLoading:true,
            isFailed:false
        });
        this.registerRequest(this.groupRP.request,this.roleRP.request);

        this.setState({
            isLoadingGroup:true,
            treeData:null,
        });
        let requests = Promise.all([this.groupRP.request,this.roleRP.request]);
        requests
            .then(res=>{
                let groupData = res[0].Data||[];
                let list = groupData.map(c=>{
                    let catalog = c.Path.split('/');
                    catalog.pop();
                    catalog.shift();
                    catalog.push(c.Id)
                    catalog = catalog.join('|');
                    return {
                        name: c.Name,
                        value: c.Id,
                        catalog:catalog
                    }
                });
                const dataTree = new Tree(list);
                const treeData = dataTree.init({name:'全部区域',value:-1});
                this.setState({
                    isLoadingGroup:false,
                    treeData:treeData
                });
                let roleData = res[1].Data||[];
                let roleList = roleData.map(c=>{
                    return {
                        name:c.Name,
                        value:c.Id
                    }
                });
                let val = (roleList[0]?roleList[0].value:null);
                val = !selectStates.getSelect('role').multiple? val:[{value:val}];
                this.userSetSelectState('role',{
                    options: roleList,
                    isLoading: false,
                    value:val,
                });
                this.handleEditableDataChange('RoleId',val)
            })
            .catch(err=>{
                if (!err.abort) {
                    this.userSetSelectState('role',{
                        isLoading:false,
                        isFailed:true,
                        isLoadingGroup:false
                    });
                }
            })
    }
    getEditableData(user){
        if (user) {
            return {
                Name: user.Name || '',
                PhoneNo: user.PhoneNo || '',
                RoleId: user.RoleId || '',
                Groups: user.Groups.map((t)=> {
                    return t.Id
                }) || [{Id: ''}],
                Username: user.Username || '',
                Password: user.Password || ''
            }
        }
        //重置
        else {
            return {
                Name: '',
                PhoneNo: '',
                RoleId: '',
                Groups: [{Id: ''}],
                Username: '',
                Password: ''
            }
        }
    }
    /**
     * 保存添加更改
     */
    savingAdd() {
        let {editableData,isSave} = this.state;
        this.userAddRP && this.userAddRP.request.abort();
        this.userAddRP = apis.usermanage.addUserDetail(editableData);
        this.registerRequest(this.userAddRP.request);
        this.userAddRP.promise
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
        const {editableData,isLoadingUserDetailFailed,loadingFailedText,isShow,
            isLoadingUserDetail,selectStates,treeData,isLoadingGroup,currentGroupId} = this.state;
        const {hideEditModal} = this.props;
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
        });

        return(
            <Modal width="540" height="480" show={isShow} onClick={()=>this.userSetSelectState(null,{open:false})}>
                <Modal.Header text="添加用户信息" onClose={()=>{this.handleClose()}}/>

                <Modal.Content isLoading={isLoadingUserDetail}
                               loadingText="正在获取详情"
                               isLoadingFailed={isLoadingUserDetailFailed}
                               loadingFailedText={loadingFailedText}
                >
                    <Table align="left"
                           noborder={true}>
                        <Table.Body>
                            <tr>
                                <td>登录名</td>
                                <td>
                                    <Input size="thin" block={true}>
                                        <input value={editableData.Username}
                                               onChange={(e)=>this.handleEditableDataChange('Username',e.target.value)}
                                        />
                                    </Input>
                                </td>
                                <td>登录密码</td>
                                <td>
                                    <Input size="thin"
                                           block={true}
                                    >
                                        <input
                                            onChange={(e)=>this.handleEditableDataChange('Password',e.target.value)}
                                            value={editableData.Password}
                                        />
                                    </Input>
                                </td>
                            </tr>
                            <tr>
                                <td>真实姓名</td>
                                <td>
                                    <Input size="thin"
                                           block={true}
                                    >
                                        <input
                                            onChange={(e)=>this.handleEditableDataChange('Name',e.target.value)}
                                            value={editableData.Name}
                                        />
                                    </Input>
                                </td>
                                <td>电话</td>
                                <td>
                                    <Input size="thin"
                                           block={true}
                                    >
                                        <input
                                            value={editableData.PhoneNo}
                                            onChange={(e)=>this.handleEditableDataChange('PhoneNo',e.target.value)}

                                        />
                                    </Input>

                                </td>
                            </tr>
                            <tr>
                                <td>角色</td>
                                <td>
                                    <MySelect onChange={(obj)=>this.userSetSelectState('role',obj)}
                                              {...selectStates.getSelect('role')} style={{width:'100%',height:'30px'}}
                                              className="condition-search">
                                        {selectStates.getSelect('role').open&&
                                        <SelectList {...selectStates.getSelect('role')}
                                                    onChange={(obj,cb)=>{this.userSetSelectState('role',obj,cb);
                                                        this.handleEditableDataChange('RoleId',obj.value)}}
                                        />}
                                    </MySelect>
                                </td>
                            </tr>
                            <tr>
                                <td>所在权限</td>
                                <td colSpan="3">
                                    <PanelTable text={titleText}
                                                align="center"
                                                isLoading={isLoadingGroup}
                                                loadingText="正在获取数据"

                                    >
                                        <div style={{height:'200px',overflow:scroll}}>
                                            <TreeList data={treeData} onClick={(item)=>this.handleTreeList(item)}
                                                      handleCheck={(val)=>{
                                                          this.setState({currentGroupId:val==currentGroupId?null:val});
                                                          let groupIdNameMap = val.map(i=>{return{Id:i}});
                                                          this.handleEditableDataChange('Groups',groupIdNameMap)}}
                                                      value={currentGroupId} isSelecteImg={true} multiple={true}/>
                                        </div>

                                    </PanelTable>
                                </td>
                            </tr>
                        </Table.Body>
                    </Table>
                    <p>
                    </p>
                    <div className="text-center">
                        <Button size="thin" type="outline" style={{width:100,marginRight:50}}
                                onClick={()=>{this.handleClose()}}>取消
                        </Button>
                        <Button size="thin" style={{width:100}} onClick={()=>{this.savingAdd()}}>保存
                        </Button>
                    </div>
                </Modal.Content>

            </Modal>
        )
    }
}