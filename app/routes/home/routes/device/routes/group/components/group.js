/**
 * 创建于：2016-6-13
 * 创建人：杨骐彰
 * 说明： 设备分组页面
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'modal'
import PanelTable from 'redux-components/paneltable'
import Table from 'redux-components/table'
import Button from 'redux-components/button'
import {Input} from 'redux-components/formcontrol'
import PreLoader from 'redux-components/preloader'
import apis from 'apis'
import config from '../../../../../../../config'
import DetailModal from './detailmodal'
import AddModal from './addmodal'
import EditModal from './editmodal'
import icons from 'icons'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
import {SideCondition,SideConditionChild} from 'redux-components/side-condition'
import {TreeList,Tree} from 'redux-components/treeList'
import store from 'store'
import './style.scss'
import {getParentNode} from 'utils'
class Group extends BaseComponent {
    constructor() {
        super(...arguments);
        let selectStates = new SelectState([['community',{}]]);
        this.state = {
            //分组名称
            groupName: '',
            //管理区域
            community: null,
            //是否正在查询
            isLoadingGroupList: false,
            //分组列表
            groupList: null,
            //显示详情modal
            isShowDetailModal: false,
            //显示新建modal
            isShowAddModal: false,
            //当前选中的分组
            activeGroupInfo: null,
            currentGroupId:1,
            treeData:null,
            isLoadedGroup: false,
            selectStates:selectStates,
            groupAllList:[]
        }

    }
    groupSetSelectState(type,obj,cb) {
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
    /*获取分组*/
    getGroupData(id){
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
                if(!this.mounted)return;
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
                },()=>this.search())

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
    handleTreeList(item){
        let data = this.state.treeData;
        data = Tree.setShow(item,data);
        this.setState({treeData:data})
    }
    componentDidMount(){
        this.getCommunityData()
    }
    /*获取区域管理列表*/
    getCommunityData(){
        let {selectStates} = this.state;

        let list  = this.props.list
        if(list.length>0){
            let communityId = store.get('communityId');
            let val = communityId||(list[0]?list[0].value:null);
            val = !selectStates.getSelect('community').multiple? val:[{value:val}];
            this.getGroupData(val);
            this.groupSetSelectState('community',{
                options: list,
                isLoading: false,
                value:val,
            });
        }

        this.communityRP&&this.communityRP.request.abort();
        this.communityRP = apis.group.getGroupListByCommunityID();
        this.registerRequest(this.communityRP.request);
        this.communityRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                this.setState({
                    groupAllList:data.map(i=>{
                        i.name=i.Name
                        i.value = i.Id
                        return i
                    })
                })
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                }
            })
    }
    /**
     * 查询
     */
    search(id) {
        const {currentGroupId} = this.state;
        this.groupRP && this.groupRP.request.abort();
        this.setState({
            isLoadingGroupList: true
        });
        this.groupRP = apis.group.getGroupListByCommunityID(
            id||currentGroupId,1);
        this.registerRequest(this.groupRP.request);
        this.groupRP.promise
            .then((res)=> {
                if(!this.mounted)return;

                let data = res.Data || [];
                this.setState({
                    groupList: data,
                    isLoadingGroupList: false
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingGroupList: false
                    });
                }
            })
    }

    /**
     * 打开分组详情框
     * @param group
     */
    showDetailModal(group) {
        this.setState({
            isShowDetailModal: true,
            activeGroupInfo: group
        });
    }

    /**
     * 关闭详情框
     */
    closeDetailModal() {
        this.setState({
            isShowDetailModal: false,
            activeGroupInfo: null
        });
    }

    /**
     * 显示新建分组模态框
     */
    showAddModal(groupType) {
        this.setState({
            isShowAddModal: true,
            groupType:groupType
        });
    }

    /**
     * 关闭新建框
     */
    closeAddModal() {
        this.setState({
            isShowAddModal: false
        });
    }

    /**
     * 显示修改分组模态框
     */
    showEditModal(group) {
        this.setState({
            activeGroupInfo: group,
            isShowEditModal: true
        });
    }

    /**
     * 关闭新建框
     */
    closeEditModal() {
        this.setState({
            activeGroupInfo: null,
            isShowEditModal: false
        });
    }

    /**
     * 解散
     * @param group
     */
    unbind(group) {
    let {selectStates} = this.state;
    confirm({
        title: '解散提示',
        content: '解散分组后，无法再批量控制该分组设备，并且无法查看该分组的用电信息，确认解散吗？',
        confirmText: '解散分组',
        onConfirm: ()=> {
            modalLoading({key:'unbind'});
            let deleteGroupRP = apis.group.deleteGroup(group.Id);
            deleteGroupRP.promise
                .then(()=> {
                    alert('解散成功');
                    this.search();
                    setTimeout(()=>this.getGroupData(selectStates.getSelect('community').value),500)
                })
                .catch((err)=> {
                    if (!err.abort) {
                        alert(err.msg);
                    }
                })
                .done(()=> {
                    closeLoading('unbind');
                });
            this.registerRequest(deleteGroupRP.request);
        }
    });
}

    render() {
        const {selectStates,community,isLoadingGroupList,groupList,isShowDetailModal,groupType,
            activeGroupInfo,isShowAddModal,isShowEditModal,treeData,isLoadingGroup,currentGroupId,groupAllList} = this.state;
        let isRoom = true;
        treeData&&treeData.some(i=>{
            if(i.value===currentGroupId){
                isRoom = !(i.groupType===1)
                return true
            }else {
                return false
            }
        })
        return (
            <div>
                <div className="sem-has-middle-bar group" onClick={()=>this.groupSetSelectState(null,{open:false})}>
                    <SideCondition >
                        <SideConditionChild  className="search" text="查询条件"  height="30%">
                            <Table align="left" noborder={true}>
                                <Table.Body className="side-search">
                                    <tr>

                                        <td>
                                            查询对象：
                                            <MySelect onChange={(obj)=>this.groupSetSelectState('community',obj)}
                                                      {...selectStates.getSelect('community')} getData={()=>this.getCommunityData()}
                                                      style={{maxWidth:'130px'}}>
                                                {selectStates.getSelect('community').open&&
                                                <SelectList {...selectStates.getSelect('community')}
                                                            onChange={(obj,cb)=>{this.groupSetSelectState('community',obj,cb);
                                                                obj.value&&this.getGroupData(obj.value)}}
                                                />}
                                            </MySelect>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{textAlign:'center'}}>
                                            <Button className="condition-button"  onClick={this.search.bind(this)}>查询</Button>
                                        </td>
                                    </tr>
                                </Table.Body>

                            </Table>
                        </SideConditionChild>
                        <SideConditionChild className="list" text="选择区域">
                            <div className="group-condition-wrapper" >
                                {isLoadingGroup?<PreLoader/>
                                    : <TreeList data={treeData} onClick={(item)=>this.handleTreeList(item)}
                                                handleCheck={(val)=>{this.setState({currentGroupId:val})
                                                this.search(val)}}
                                                value={currentGroupId}/>}
                            </div>
                        </SideConditionChild>
                    </SideCondition>
                    <div className="sem-main-content" >
                        <PanelTable text="分组列表"
                                    align="center"
                                    isLoading={isLoadingGroupList}
                                    loadingText="正在获取分组列表信息"
                        >
                            {
                                !isLoadingGroupList&&<div>
                                    <div className="table-need-head">
                                        <Table>
                                            <Table.Head titles={['序号','所属区域','包含设备数','操作']}/>
                                            <Table.Body>
                                                {
                                                    groupList && groupList.map((group, i)=> {
                                                        return (
                                                            <tr key={i}>
                                                                <td>{i+1}</td>
                                                                <td>
                                                                    {group.Name}
                                                                </td>
                                                                <td>{group.DevicesCount}</td>
                                                                <td>
                                                                    <Table.Operate image={icons.modify} text="修改"
                                                                                   onClick={()=>this.showEditModal(group)}
                                                                    />
                                                                    <Table.Operate image={icons.detail} text="详情"
                                                                                   onClick={()=>this.showDetailModal(group)}
                                                                    />
                                                                    <Table.Operate image={icons.disband} text="解散"
                                                                                   onClick={()=>this.unbind(group,0)}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </Table.Body>
                                        </Table>

                                    </div>
                                    <div className="table-need-body"
                                         style={{maxHeight:'700px'}}>
                                        <Table>
                                            <Table.Head titles={['序号','所属区域','包含设备数','操作']}/>
                                            <Table.Body>
                                                {
                                                    groupList && groupList.map((group, i)=> {
                                                        return (
                                                            <tr key={i}>
                                                                <td>{i+1}</td>
                                                                <td>
                                                                    {group.Name}
                                                                </td>
                                                                <td>{group.DevicesCount}</td>
                                                                <td>
                                                                    <Table.Operate image={icons.modify} text="修改"
                                                                                   onClick={()=>this.showEditModal(group)}
                                                                    />
                                                                    <Table.Operate image={icons.detail} text="详情"
                                                                                   onClick={()=>this.showDetailModal(group)}
                                                                    />
                                                                    <Table.Operate image={icons.disband} text="解散"
                                                                                   onClick={()=>this.unbind(group,0)}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </Table.Body>
                                        </Table>
                                        {(groupList!=null&&groupList.length==0) && <h5 className="text-center">未查询或没有查询到结果</h5>}

                                    </div>
                                    
                                    {isRoom&&
                                    ((groupList!=null&&groupList.length==0)?
                                            <div className="add-button-center">
                                                <div></div>
                                                <Button className="distanceX"
                                                        type="outline"
                                                        hasAddOn={true}
                                                        onClick={()=>{this.showAddModal(0)}}
                                                >
                                                    <Button.AddOn
                                                        src={icons.addArea}
                                                    />
                                                    新建区域
                                                </Button></div>:
                                            <Button className="distanceX"
                                                    type="outline"
                                                    hasAddOn={true}
                                                    onClick={()=>{this.showAddModal(0)}}
                                                    style={{border:'0',margin:'10px'}}

                                            >
                                                <Button.AddOn
                                                    src={icons.addArea}
                                                />
                                                新建区域
                                            </Button>
                                    )

                                    }
                                    {isRoom&&(
                                        (groupList!=null&&groupList.length==0)?
                                            <div className="add-button-center">
                                                <div></div>
                                                <Button className="distanceX"
                                                        type="outline"
                                                        hasAddOn={true}
                                                        onClick={()=>{this.showAddModal(1)}}
                                                >
                                                    <Button.AddOn
                                                        src={icons.addArea}
                                                    />
                                                    新建房间
                                                </Button></div>:
                                        <Button className="distanceX"
                                                type="outline"
                                                hasAddOn={true}
                                                onClick={()=>{this.showAddModal(1)}}
                                                style={{border:'0',margin:'10px'}}

                                        >
                                            <Button.AddOn
                                                src={icons.addArea}
                                            />
                                            新建房间
                                        </Button>)
                                    }
                                </div>
                            }
                            <br />
                            <Button type="outline"
                                    hasAddOn={true}
                                    onClick={()=>{window.open(config.apiHost+"/DeviceExcel")}}
                                    style={{display:"none"}}
                            >
                                <Button.AddOn
                                    src={icons.exports}

                                />
                                导出表格
                            </Button>
                        </PanelTable>
                    </div>

                </div>
                {isShowDetailModal && <DetailModal groupInfo={activeGroupInfo}
                                                   onClose={this.closeDetailModal.bind(this)}
                />}

                {isShowAddModal && <AddModal onAdded={()=>{this.search()}} currentGroupId={currentGroupId}
                                             list={groupAllList} groupType={groupType}
                                             onClose={()=>{this.closeAddModal();
                                                 setTimeout(()=>this.getGroupData(selectStates.getSelect('community').value),500)}}
                />}

                {isShowEditModal && <EditModal onChanged={()=>{this.search()}}
                                               groupInfo={activeGroupInfo}
                                               currentGroupId={currentGroupId}
                                               onClose={this.closeEditModal.bind(this)}
                />}
            </div>
        )
    }
}

module.exports = Group;
