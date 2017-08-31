/**
 * Created by whj on 2016/6/13.
 */
import React from 'react'
import BaseComponent from 'basecomponent'
import PanelTable from 'redux-components/paneltable'
import Table from 'redux-components/table'
import Button from 'redux-components/button'
import {Input} from 'redux-components/formcontrol'
import Pagination from 'pagination'
import Icons from 'icons'
import apis from 'apis'
import EditModal from './editmodal'
import store from 'store'
import AddModal from './addmodal'
import Modal from 'redux-components/rmodal'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
import {getParentNode} from 'utils'
import {SideCondition,SideConditionChild} from 'redux-components/side-condition'
import './style.scss'
export default class UserManage extends BaseComponent {
    constructor() {
        super(...arguments);
        let selectStates = new SelectState([
                ['community',{allowEmpty:true,placeholder:'不限'}],

            ]
        );
        this.state = {
            //设备条码
            q: '',
            //小区
            community: '',
            //分组
            isManage: 1,
            //是否正在加载列表
            isLoadingUserList: false,
            //设备列表
            userList: null,
            //是否正在加载详情
            isLoadingUserDetail: false,
            //设备详情
            userDetailInfo: {},
            //是否被全选
            allSelect: false,
            //当前选中的用户的id
            currentId: null,
            //分页参数
            pageParams: {
                current: 1,
                total: 0
            },
            page: 1,
            roleList: [],
            isEdit: true,
            isSave: false,
            isLoadedCommunity: false,
            isFirst: true,
            selectStates:selectStates

        };
        this.pageSize = 10;
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
    /**
     * 关闭modal
     */
    hideEditModal() {
        this.setState({
            isShowEditModal: false,
            isLoadingDeviceDetail: false,
            isShowAddModal:false
        });
    }

    /*获取区域管理列表*/
    getCommunityData(){
        let {selectStates} = this.state;
        let list  = this.props.list
        if(list.length>0){
            let communityId = store.get('communityId');
            let val = communityId||(list[0]?list[0].value:null);
            val = !selectStates.getSelect('community').multiple? val:[{value:val}];
            this.userSetSelectState('community',{
                options: list,
                isLoading: false,
                value:val,
            },()=>this.search());
        }



     /*   this.communityRP&&this.communityRP.request.abort();
        this.communityRP = apis.group.getGroupListByCommunityID();
        this.userSetSelectState('community',{
            isLoading:true,
            isFailed:false
        });
        this.setState({
            isLoadingGroup:true,
            treeData:[],
        });
        this.registerRequest(this.communityRP.request);
        this.communityRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                let list = getParentNode(data);
                let communityId = store.get('communityId');
                let val = communityId||(list[0]?list[0].value:null);
                val = !selectStates.getSelect('community').multiple? val:[{value:val}];
                this.userSetSelectState('community',{
                    options: list,
                    isLoading: false,
                    value:val,
                },()=>this.search());
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.userSetSelectState('community',{
                        isLoading:false,
                        isFailed:true
                    });
                }
            })*/
    }
    componentDidMount(){
        this.getCommunityData()
    }
    
    getAreasName(areas) {
        if (areas) {
            var areasName = areas.map(function (item) {
                return item.Name
            })
            return areasName.join(",")
        }

    }

    deleteUser() {
        var id = this.state.currentId;
        confirm({
            title: '删除提示',
            content: '删除用户后，该账号将不能登录到平台！确认删除吗？',
            confirmText: '删除',
            closeText:'取消',
            onConfirm: ()=> {
                modalLoading({key:'delete'});
                this.userDisableRP&&this.userDisableRP.request.abort()
                this.userDeleteRP = apis.usermanage.deleteUser(id);
                this.registerRequest(this.userDeleteRP);
                this.userDeleteRP.promise
                    .then(()=> {
                        alert('删除成功');
                        this.search();
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

    disableUser(status,id) {
        let text = status==0?'禁用':'启用';
        confirm({
            title: `${text}提示`,
            content: `${text}用户后，将影响该账号登录本平台！确认要${text}吗？`,
            confirmText: `${text}`,
            onConfirm: ()=> {
                modalLoading({key:'disable'});
                this.userDeleteRP&&this.userDeleteRP.request.abort();
                this.userDisableRP = apis.usermanage.disabledUser(id);
                this.registerRequest(this.userDisableRP.request);
                this.userDisableRP.promise
                    .then(()=> {
                        alert(`${text}成功`);
                        this.search();
                    })
                    .catch((err)=> {
                        if (!err.abort) {
                            alert(err.msg);
                        }
                    })
                    .done(()=> {
                        closeLoading('disable');
                    });
            }
        });
    }

    search() {
        const {q,selectStates,isManage,page} = this.state;
        this.state.pageParams.current = page
        
        this.setState({
            isLoadingUserList: true,
            pageParams: this.state.pageParams,
            userList:[]
        });
        let pageSize = this.pageSize;
        let params = {
            q: q,
            community: selectStates.getSelect('community').value,
            IsManage: isManage
        }
        this.userRP = apis.usermanage.getUserListWithRange(params, (page - 1) * pageSize, pageSize);
        this.registerRequest(this.userRP.request);

        this.userRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res[0].Data || [];
                this.state.pageParams.total = res[1].Count||data.length ||0;
                this.setState({
                    userList: data,
                    isLoadingUserList: false,
                    pageParams: this.state.pageParams
                });
            })
            .catch((err)=> {
                console.log(err)
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingUserList: false
                    });
                }
            })
    }

    handleAutoSearch(){
        const {isLoadedCommunity,isFirst} = this.state;
        if(isFirst&&isLoadedCommunity){
            this.setState({isFirst: false});
            this.search();
        }
    }
    render() {
        const {community,q,isLoadingUserList,userList,isShowEditModal,pageParams,isShowAddModal,
            selectStates} = this.state;
        return (
            <div className="user">
                <div className="sem-has-middle-bar user" onClick={()=>this.userSetSelectState(null,{open:false})}>
                    <SideCondition >
                        <SideConditionChild  className="search" text="查询条件"  height="40%">
                            <Table align="left" noborder={true}>
                                <Table.Body className="side-search">
                                    <tr>
                                        <td>
                                            用   户   名 ：
                                            <Input
                                                style={{maxWidth:'130px'}}
                                            ><input
                                                value={q}
                                                placeholder="用户名"
                                                onChange={(e)=>{this.setState({q:e.target.value})}}/></Input>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            查询对象：
                                            <MySelect onChange={(obj)=>this.userSetSelectState('community',obj)}
                                                      {...selectStates.getSelect('community')} getData={()=>this.getCommunityData()}
                                                      style={{maxWidth:'130px'}}>
                                                {selectStates.getSelect('community').open&&
                                                <SelectList {...selectStates.getSelect('community')}
                                                            onChange={(obj,cb)=>{this.userSetSelectState('community',obj,cb);
                                                            }}
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
                    </SideCondition>
                    <div className="sem-main-content"  >
                        <PanelTable text="用户列表"
                                    align="center"
                                    isLoading={isLoadingUserList}
                                    loadingText="正在获取用户列表信息"
                        >
                            {
                                !isLoadingUserList&&<div>
                                    <div  className="table-need-head">
                                        <Table>
                                            <thead>
                                            <tr>
                                                <th className="text-left">
                                                    用户姓名
                                                </th>
                                                <th>
                                                    电话
                                                </th>
                                                <th>
                                                    角色
                                                </th>

                                                <th>
                                                    登录名
                                                </th>
                                                <th>
                                                    状态
                                                </th>
                                                <th>
                                                    操作
                                                </th>
                                            </tr>
                                            </thead>
                                            <Table.Body>
                                                {
                                                    userList && userList.map((t, i)=> {
                                                        return (
                                                            <tr key={i}>
                                                                <td className="text-left">
                                                                    {t.Name}
                                                                </td>
                                                                <td>{t.PhoneNo}</td>
                                                                <td>{t.RoleName}</td>

                                                                <td>{t.Username}</td>
                                                                <td>
                                                                    <Table.Operate image={t.Status!=0?Icons.choose:Icons.unChoose}text="禁用"
                                                                                   onClick={()=>{if(t.Status==0){this.disableUser(t.Status,t.Id);}}}
                                                                    />
                                                                    <Table.Operate image={t.Status==0?Icons.choose:Icons.unChoose} text="启用"
                                                                                   onClick={()=>{if(t.Status!=0){this.disableUser(t.Status,t.Id);}}}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <Table.Operate image={Icons.modify} text="修改" onClick={()=>{
                                                                        this.setState({isEdit:true,isSave:false,
                                                                            currentId:t.Id,isShowEditModal:true});

                                                                    }}
                                                                    />
                                                                    <Table.Operate image={Icons.delete} text="删除" onClick={()=>{
                                                                        this.setState({currentId:t.Id},()=>this.deleteUser());
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
                                                <th className="text-left">
                                                    用户姓名
                                                </th>
                                                <th>
                                                    电话
                                                </th>
                                                <th>
                                                    角色
                                                </th>

                                                <th>
                                                    登录名
                                                </th>
                                                <th>
                                                    状态
                                                </th>
                                                <th>
                                                    操作
                                                </th>
                                            </tr>
                                            </thead>
                                            <Table.Body>
                                                {
                                                    userList && userList.map((t, i)=> {
                                                        return (
                                                            <tr key={i}>
                                                                <td className="text-left">
                                                                    {t.Name}
                                                                </td>
                                                                <td>{t.PhoneNo}</td>
                                                                <td>{t.RoleName}</td>

                                                                <td>{t.Username}</td>
                                                                <td>
                                                                    <Table.Operate image={t.Status!=0?Icons.choose:Icons.unChoose}text="禁用"
                                                                                   onClick={()=>{if(t.Status==0){this.disableUser(t.Status,t.Id);}}}
                                                                    />
                                                                    <Table.Operate image={t.Status==0?Icons.choose:Icons.unChoose} text="启用"
                                                                                   onClick={()=>{if(t.Status!=0){this.disableUser(t.Status,t.Id);}}}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <Table.Operate image={Icons.modify} text="修改" onClick={()=>{
                                                                        this.setState({isEdit:true,isSave:false,
                                                                            currentId:t.Id,isShowEditModal:true});

                                                                    }}
                                                                    />
                                                                    <Table.Operate image={Icons.delete} text="删除" onClick={()=>{
                                                                        this.setState({currentId:t.Id},()=>this.deleteUser());
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
                            {(!userList || !userList.length) && <h5 className="text-center">未查询或没有查询到结果</h5>}
                            <Button type="outline"
                                    hasAddOn={true}
                                    onClick={()=>{
                                        this.setState({isEdit:false,isSave:false,isShowAddModal:true});
                                    }}
                                    style={{border:'0',margin:'10px'}}
                            >
                                <Button.AddOn
                                    src={Icons.addUser}
                                />
                                添加用户
                            </Button>
                        </PanelTable>
                        <br/>
                        <div className="clear-fix">
                            <Pagination current={pageParams.current}
                                        total={pageParams.total}
                                        size={this.pageSize}
                                        onChange={(p)=>{
                                            this.setState({page:p},()=>this.search())
                                        }}
                            />
                        </div>
                    </div>
                </div>
                {
                    isShowEditModal&&
                    <EditModal
                        hideEditModal={this.hideEditModal.bind(this)}
                        search = {this.search.bind(this)}
                        id = {this.state.currentId}

                    />
                }
                {
                    isShowAddModal&&
                    <AddModal
                        hideEditModal={this.hideEditModal.bind(this)}
                        search = {this.search.bind(this)}
                        id = {selectStates.getSelect('community').value}
                    />
                }
            </div>
        )
    }
}
module.exports = UserManage;