/**
 * Created by whj on 2016/7/4.
 */
import React from 'react'
import BaseComponent from 'basecomponent'
import PanelTable from 'redux-components/paneltable'
import Table from 'redux-components/table'
import Button from 'redux-components/button'
import {Input} from 'redux-components/formcontrol'
import PreLoader from 'redux-components/preloader'
import icons from 'icons'
import apis from 'apis'
import EditModal from './editemodal'
import AddModal from './addmodal'
import AddModeModal from './addmodemodal'
import './style.scss'
import {TreeList,Tree} from 'redux-components/treeList'
import {SideCondition,SideConditionChild} from 'redux-components/side-condition'
import store from 'store'
import EditModeModal from './editmodemodal'
import EditAreaModal from './editareamodal'
import AddAreaModal from './addareamodal'
import DetailModal from './detailmodal'




export default class CommunityManage extends BaseComponent {
    constructor() {
        super(...arguments);
        let level = store.get('level') || 0;
        this.state = {
            //设备条码
            q: '',
            //是否正在加载列表
            isLoadingCommunityList: false,
            //设备列表
            communityList: null,
            //显示编辑弹窗
            isShowEditModal: false,
            isShowAddModal:false,
            //显示添加弹窗
            isShowAddModeModal:false,
            //当前选中的用户的id
            currentId: null,
            isLoadingGroup:false,
            treeData:[],
            currentGroupId:null,
            treeLevel:level,
            singleModeData:{},
            isShowEditModeModal:false,
            isLoadingGroupList: false,
            groupList:[],
            isShowAddAreaModal:false,
            isShowEditAreaModal:false,
            activeGroupInfo:null,
            isShowDetailAreaModal:false,
            groupType:0,

        }
    }
    handleEditableDataChange(key, value) {
        let {editableData} = this.state;
        editableData[key] = value;
        this.setState({
            editableData: editableData
        });
    }
    handleTreeList(item){
        let data = this.state.treeData;
        data = Tree.setShow(item,data);
        this.setState({treeData:data})
    }
    listSetSelectState(type,obj,cb) {
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

    /**
     * 关闭modal
     */
    hideEditModal() {
        this.communityDetailRP && this.communityListRP.request.abort();
        this.setState({
            isShowEditModal: false,
            isShowAddModal:false,
            isShowAddModeModal:false,
            isShowEditModeModal:false,
            isLoadingDeviceDetail: false,
            isShowEditAreaModal:false,
            isShowAddAreaModal:false,
            isShowDetailAreaModal:false,
        });
    }
    
    /*获取区域管理列表*/
    getCommunityData(){
        let list  = this.props.list;
        if(list.length>0){
            let data = list.map(item=>{
                let catalog = [1000];
                catalog.push(item.value);
                catalog = catalog.join('|')
                return {
                    name: item.name,
                    value: item.value,
                    catalog: catalog,
                    Level: 1,
                }
            });
            const dataTree = new Tree(data);
            const treeData = dataTree.init({name:'全部区域',value:1000});
            this.setState({
                treeData:treeData
            },()=>this.search())
        }

    }
    /*获取分组*/
    getGroupData(id){
        let treeLevel = this.state.treeLevel;
        this.groupRP && this.groupRP.request.abort();
        let communityId = store.get('communityId');
        let cid = id || communityId;
        if (!cid && cid == 0)return;
        this.groupRP = apis.group.getGroupListByCommunityID(cid);
        this.registerRequest(this.groupRP.request);
        this.setState({
            isLoadingGroup:true,
            treeData:[],
            currentGroupId:cid,
        });
        this.groupRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                let treeTop={};
                data.map((d,i)=>{
                    if(d.Id == cid){
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
                },()=>{this.getGroupMode()})
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

    getGroupMode(id){
        let {currentGroupId} = this.state;
        this.setState({
            isLoadingModeData:true,
            modeData:[],
        })
        this.getGroupModeRP && this.getGroupModeRP.request.abort();
        this.getGroupModeRP = apis.group.getGroupMode(id ||currentGroupId);
        this.registerRequest(this.getGroupModeRP.request);
        this.getGroupModeRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data;
                this.setState({
                    isLoadingModeData:false,
                    modeData:data
                })
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingModeData: false
                    });
                }
            })
    }

    deleteMode(c) {
        let  id = c || this.state.currentId;
        confirm({
            title: '删除提示',
            content: '确认删除改分区方式吗？',
            confirmText: '删除',
            closeText:'取消',
            onConfirm: ()=> {
                modalLoading({key:'delete'});
                this.modeDeleteRP&&this.modeDeleteRP.request.abort()
                this.modeDeleteRP = apis.group.deleteGroupMode(id);
                this.registerRequest(this.userDeleteRP);
                this.modeDeleteRP.promise
                    .then(()=> {
                        alert('删除成功');
                        this.getGroupMode();
                    })
                    .catch((err)=> {
                        if (!err.abort) {
                            alert(err.msg);
                        }
                    })
                    .done(()=> {
                        closeLoading('delete');
                    });
            }
        });

    }
    getGroupList(id) {
        const {currentGroupId} = this.state;
        let cid = id || currentGroupId;
        if (!cid && cid == 0)return;
        this.groupRP && this.groupRP.request.abort();
        this.setState({
            isLoadingGroupList: true,
            groupList: []
        });
        this.groupRP = apis.group.getGroupListByCommunityID(cid,1);
        this.registerRequest(this.groupRP.request);
        this.groupRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                data.map(i=>{
                        i.name=i.Name
                        i.value = i.Id
                        return i
                    })
              
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


    unbind(group) {
        confirm({
            title: '删除提示',
            content: '删除分组后，无法再批量控制该分组设备，并且无法查看该分组的用电信息，确认删除吗？',
            confirmText: '删除分组',
            onConfirm: ()=> {
                modalLoading({key:'unbind'});
                let deleteGroupRP = apis.group.deleteGroup(group.Id);
                deleteGroupRP.promise
                    .then(()=> {
                        alert('删除成功');
                        this.getGroupList();
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
    search() {
        const {q} = this.state;
        this.setState({
            isLoadingCommunityList: true,
            communityList:[]
        });
        this.communityListRP = apis.group.getGroupListByCommunityID(null,null,1);
        this.registerRequest(this.communityListRP.request);
        this.communityListRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data;
                let list = [];
                data.map((i)=>{
                    if(i.Level==1){
                        list.push(i)
                    }
                })
                this.setState({
                    isLoadingCommunityList: false,
                    communityList: list
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingCommunityList: false
                    });
                }
            })
    }
    componentDidMount(){
        let treeLevel = this.state.treeLevel;
        if(treeLevel==0){
            this.getCommunityData();
        }else{
            this.getGroupData()
        }
        
    }


    render() {
        const {q,isLoadingCommunityList,communityList,isShowEditModal,isShowAddModeModal,isLoadingModeData,
            modeData,treeData,currentGroupId,isLoadingGroup,treeLevel,isShowEditModeModal,singleModeData,
            isShowAddModal,groupList,isShowAddAreaModal,isShowEditAreaModal,activeGroupInfo,isShowDetailAreaModal,groupType} = this.state;
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
                <div className="sem-has-middle-bar  community">


                    <SideCondition >
                        <SideConditionChild  className="search" text="选择区域"  height="40%">
                            <Button type="outline"
                                    style={{border:'0',margin:'10px',position:'absolute',top:'2px',left:'100px'}}
                                    hasAddOn={true} onClick={()=>{this.setState({treeLevel:0},this.getCommunityData())}}
                            >
                                <Button.AddOn
                                    src={icons.return}
                                />
                                返回区域列表
                            </Button>
                            {
                                treeLevel==0&&<TreeList data={treeData} onClick={(item)=>this.handleTreeList(item)}
                                                        handleCheck={(val,level)=>{this.setState({currentGroupId:val,treeLevel:1},()=>this.getGroupData(val));}}
                                                        value={currentGroupId}/>
                            }
                            {
                                treeLevel ==1&& (isLoadingGroup?<PreLoader/>
                                    : <TreeList data={treeData} onClick={(item)=>this.handleTreeList(item)}
                                                handleCheck={(val,level)=>{this.setState({currentGroupId:val,treeLevel:level},()=>this.getGroupList())
                                                this.search(val)}}
                                                value={currentGroupId}/>)
                            }
                            {
                                treeLevel>1&&<TreeList data={treeData} onClick={(item)=>this.handleTreeList(item)}
                                                       handleCheck={(val,level)=>{this.setState({currentGroupId:val,treeLevel:level},()=>this.getGroupList())
                                                this.search(val)}}
                                                       value={currentGroupId}/>
                            }
                            
                        </SideConditionChild>
                    </SideCondition>
                    <div className="sem-main-content"  >
                        {
                            !treeLevel&& <PanelTable text="小区列表"
                                                     align="center"
                                                     isLoading={isLoadingCommunityList}
                                                     loadingText="正在获取小区列表信息"
                            >
                                {
                                    !isLoadingCommunityList&&<div>
                                        <div  className="table-need-head">
                                            <Table>
                                                <thead>
                                                <tr>
                                                    <th>
                                                        序号
                                                    </th>
                                                    <th>
                                                        区域名称
                                                    </th>
                                                    <th>
                                                        地址
                                                    </th>
                                                    <th>
                                                        下属设备
                                                    </th>
                                                    <th>
                                                        操作
                                                    </th>
                                                </tr>
                                                </thead>
                                                <Table.Body>
                                                    {
                                                        communityList && communityList.map((t, i)=> {
                                                            return (
                                                                <tr key={i}>
                                                                    <td>{i+1}</td>
                                                                    <td >{t.Name}</td>
                                                                    <td>{t.Address}</td>
                                                                    <td>{t.DevicesCount}</td>
                                                                    <td>
                                                                        <Table.Operate image={icons.modify} text="修改" onClick={()=>{
                                                                        this.setState({currentId:t.Id,isShowEditModal:true})
                                                                    }}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </Table.Body>
                                            </Table>

                                        </div>
                                        <div style={{maxHeight:'700px'}} className="table-need-body">

                                            <Table>
                                                <thead>
                                                <tr>
                                                    <th>
                                                        序号
                                                    </th>
                                                    <th>
                                                        区域名称
                                                    </th>
                                                    <th>
                                                        地址
                                                    </th>
                                                    <th>
                                                        下属设备
                                                    </th>
                                                    <th>
                                                        操作
                                                    </th>
                                                </tr>
                                                </thead>
                                                <Table.Body>
                                                    {
                                                        communityList && communityList.map((t, i)=> {
                                                            return (
                                                                <tr key={i}>
                                                                    <td>{i+1}</td>
                                                                    <td >{t.Name}</td>
                                                                    <td>{t.Address}</td>
                                                                    <td>{t.DevicesCount}</td>
                                                                    <td>
                                                                        <Table.Operate image={icons.modify} text="修改" onClick={()=>{
                                                                        this.setState({currentId:t.Id,isShowEditModal:true})
                                                                    }}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </Table.Body>
                                            </Table>
                                        </div>
                                    </div>
                                }
                                {(!communityList || !communityList.length) && <h5 className="text-center">未查询或没有查询到结果</h5>}
                                <Button type="outline"
                                        style={{border:'0',margin:'10px'}}
                                        hasAddOn={true} onClick={()=>{this.setState({isShowAddModal:true})}}
                                >
                                    <Button.AddOn
                                        src={icons.addArea}
                                    />
                                    添加小区
                                </Button>

                            </PanelTable>
                        }
                        {
                            treeLevel ==1&& <PanelTable text="区域管理"
                                                       align="center"
                                                       isLoading={isLoadingModeData}
                                                       loadingText="正在获取区域管理信息"
                            >
                                {
                                    !isLoadingCommunityList&&<div>
                                        <div  className="table-need-head">
                                            <Table>
                                                <thead>
                                                <tr>
                                                    <th>
                                                        序号
                                                    </th>
                                                    <th>
                                                        分区方式
                                                    </th>
                                                    <th>
                                                        操作
                                                    </th>
                                                </tr>
                                                </thead>
                                                <Table.Body>
                                                    {
                                                        modeData && modeData.map((t, i)=> {
                                                            return (
                                                                <tr key={i}>
                                                                    <td>{i+1}</td>
                                                                    <td >{t.Name}</td>
                                                                    <td>
                                                                        <Table.Operate image={icons.modify} text="修改" onClick={()=>{
                                                                        this.setState({isShowEditModeModal:true,singleModeData:t})
                                                                    }}
                                                                        />
                                                                        <Table.Operate image={icons.delete} text="删除" onClick={()=>{
                                                                        this.deleteMode(t.Id)
                                                                    }}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </Table.Body>
                                            </Table>

                                        </div>
                                        <div style={{maxHeight:'700px'}} className="table-need-body">
                                            <Table>
                                                <thead>
                                                <tr>
                                                    <th>
                                                        序号
                                                    </th>
                                                    <th>
                                                        分区方式
                                                    </th>
                                                    <th>
                                                        操作
                                                    </th>
                                                </tr>
                                                </thead>
                                                <Table.Body>
                                                    {
                                                        modeData && modeData.map((t, i)=> {
                                                            return (
                                                                <tr key={i}>
                                                                    <td>{i+1}</td>
                                                                    <td >{t.Name}</td>
                                                                    <td>
                                                                        <Table.Operate image={icons.modify} text="修改" onClick={()=>{
                                                                         this.setState({isShowEditModeModal:true,singleModeData:t})
                                                                    }}
                                                                        />
                                                                        <Table.Operate image={icons.delete} text="删除" onClick={()=>{
                                                                        this.deleteMode(t.Id)
                                                                    }}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </Table.Body>
                                            </Table>

                                        </div>
                                    </div>
                                }
                                {(!modeData || !modeData.length) && <h5 className="text-center">未查询或没有查询到结果</h5>}
                                <Button type="outline"
                                        style={{border:'0',margin:'10px'}}
                                        hasAddOn={true} onClick={()=>{this.setState({isShowAddModeModal:true})}}
                                >
                                    <Button.AddOn
                                        src={icons.addWay}
                                        style={{height: 12,width:12,verticalAlign:'middle'}}
                                    />
                                    新建分区方式
                                </Button>

                            </PanelTable>}
                        {
                            treeLevel>1&& <PanelTable text="按楼层"
                                                       align="center"
                                                       isLoading={isLoadingCommunityList}
                                                       loadingText="正在获取信息"
                            >
                                {
                                    !isLoadingCommunityList&&<div>
                                        <div  className="table-need-head">
                                            <Table>
                                                <thead>
                                                <tr>
                                                    <th>
                                                        序号
                                                    </th>
                                                    <th>所属区域</th>
                                                    <th>
                                                        包含设备数
                                                    </th>
                                                    <th>
                                                        操作
                                                    </th>
                                                </tr>
                                                </thead>
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
                                                                                       onClick={()=>this.setState({isShowEditAreaModal:true,activeGroupInfo:group})}
                                                                        />
                                                                        <Table.Operate image={icons.detail} text="详情"
                                                                                       onClick={()=>this.setState({isShowDetailAreaModal:true,activeGroupInfo:group})}
                                                                        />
                                                                        <Table.Operate image={icons.disband} text="删除"
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
                                        <div style={{maxHeight:'700px'}} className="table-need-body">

                                            <Table>
                                                <thead>
                                                <tr>
                                                    <th>
                                                        序号
                                                    </th>
                                                    <th>所属区域</th>
                                                    <th>
                                                        包含设备数
                                                    </th>
                                                    <th>
                                                        操作
                                                    </th>
                                                </tr>
                                                </thead>
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
                                                                                       onClick={()=>this.setState({isShowEditAreaModal:true,activeGroupInfo:group})}
                                                                        />
                                                                        <Table.Operate image={icons.detail} text="详情"
                                                                                       onClick={()=>this.setState({isShowDetailAreaModal:true,activeGroupInfo:group})}
                                                                        />
                                                                        <Table.Operate image={icons.disband} text="删除"
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
                                    </div>
                                }
                                {(groupList!=null&&groupList.length==0) && <h5 className="text-center">未查询或没有查询到结果</h5>}

                                {isRoom&&
                                ((groupList!=null&&groupList.length==0)?
                                        <div className="add-button-center">
                                            <div></div>
                                            <Button className="distanceX"
                                                    type="outline"
                                                    hasAddOn={true}
                                                    onClick={()=>{this.setState({isShowAddAreaModal:true,groupType:0})}}
                                            >
                                                <Button.AddOn
                                                    src={icons.addArea}
                                                />
                                                新建区域
                                            </Button></div>:
                                        <Button className="distanceX"
                                                type="outline"
                                                hasAddOn={true}
                                                onClick={()=>{this.setState({isShowAddAreaModal:true,groupType:0})}}
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
                                                    onClick={()=>{this.setState({isShowAddAreaModal:true,groupType:1})}}
                                            >
                                                <Button.AddOn
                                                    src={icons.addArea}
                                                />
                                                新建房间
                                            </Button></div>:
                                        <Button className="distanceX"
                                                type="outline"
                                                hasAddOn={true}
                                                onClick={()=>{this.setState({isShowAddAreaModal:true,groupType:1})}}
                                                style={{border:'0',margin:'10px'}}

                                        >
                                            <Button.AddOn
                                                src={icons.addArea}
                                            />
                                            新建房间
                                        </Button>)
                                }

                            </PanelTable>
                        }

                    </div>
                    <br/>
                </div>
                {
                isShowEditModal&&
                <EditModal search={this.search.bind(this)}
                           hideEditModal={this.hideEditModal.bind(this)}
                           id = {this.state.currentId}
                />
                }
                {
                    isShowAddModal&&
                    <AddModal search={this.search.bind(this)}
                               hideEditModal={this.hideEditModal.bind(this)}
                    />
                }
                {
                    isShowAddModeModal&& <AddModeModal search={()=>this.getGroupData()}
                                                   id = {currentGroupId}
                                                   hideEditModal={()=>this.hideEditModal()}
                    />
                }
                
                {
                    isShowEditModeModal&& <EditModeModal search={()=>this.getGroupData()}
                                                   id = {currentGroupId}
                                                   data = {singleModeData}
                                                   hideEditModal={()=>this.hideEditModal()}
                    />
                }
                {isShowAddAreaModal && <AddAreaModal onAdded={()=>{this.getGroupList()}}
                                                     currentGroupId={currentGroupId}
                                                     list={groupList}
                                                     groupType={groupType}
                                                     hideEditModal={()=>this.hideEditModal()}
                />}

                {isShowEditAreaModal && <EditAreaModal onChanged={()=>{this.getGroupList()}}
                                                         groupInfo={activeGroupInfo}
                                                         currentGroupId={currentGroupId}
                                                       groupType={groupType}
                                                        hideEditModal={()=>this.hideEditModal()}
                />}
                {isShowDetailAreaModal && <DetailModal groupInfo={activeGroupInfo}
                                                       hideEditModal={()=>this.hideEditModal()}
                />}
            </div>
        )
    }
}
module.exports = CommunityManage;