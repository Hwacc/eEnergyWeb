/**
 * Created by whj on 2016/6/13.
 */
import React from 'react'
import BaseComponent from 'basecomponent'
import PanelTable from 'paneltable'
import Table from 'table'
import Button from 'button'
import {Input} from 'formcontrol'
import icons from 'icons'
import apis from 'apis'
import EditModal from './editmodal'
import AddModal from './addmodal'

export default class RoleManage extends BaseComponent {
    constructor() {
        super(...arguments);
        this.state = {
            //设备条码
            q: '',
            //是否正在加载列表
            isLoadingRoleList: false,
            //设备列表
            roleList: null,
            //显示编辑弹窗
            isShowEditModal: false,
            //显示添加弹窗
            isShowAddModal:false,
            //当前选中的用户的id
            currentId: null

        }
    }
    handleEditableDataChange(key, value) {
        let {editableData} = this.state;
        editableData[key] = value;
        this.setState({
            editableData: editableData
        });
    }

    /**
     * 关闭modal
     */
    hideEditModal() {
        this.roleDetailRP && this.roleDetailRP.request.abort();
        this.setState({
            isShowEditModal: false,
            isShowAddModal:false,
            isLoadingDeviceDetail: false,
        });
    }

    getAreasName(areas) {
        if (areas) {
            var areasName = areas.map(function (item) {
                return item.Name
            })
            return areasName.join(",")
        }

    }

    deleteRole() {
        //删除角色
        /*        var id = this.state.currentId;
         Modal.confirm({
         title: '删除提示',
         content: '删除用户后，该账号将不能登录到平台！确认删除吗？',
         confirmText: '删除',
         onConfirm: ()=> {
         Modal.loading();
         this.roleDeleteRP = apis.rolemanage.deleteRole(id);
         this.registerRequest(this.roleDeleteRP);
         this.roleDeleteRP.promise
         .then(()=> {
         Modal.alert('删除成功');
         this.search();
         })
         .catch((err)=> {
         if (!err.abort) {
         alert(err.msg);
         }
         })
         .done(()=> {
         Modal.closeLoading();
         });
         }
         });*/

    }

    search() {
        const {q} = this.state;
        this.setState({
            isLoadingRoleList: true
        })
        this.roleListRP = apis.rolemanage.roleList();
        this.registerRequest(this.roleListRP.request);
        this.roleListRP.promise
            .then((res)=> {
                this.setState({
                    isLoadingRoleList: false,
                    roleList: res.Data
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingRoleList: false
                    });
                }
            })
    }


    render() {
        const {q,isLoadingRoleList,roleList,isShowEditModal,isShowAddModal} = this.state;
        return (
            <div className="sem-main-content">
                <div className="distanceY">
                    <Input className="distanceX"
                           value={q}
                           placeholder="角色名称"
                           onChange={(e)=>{this.setState({q:e.target.value})}}
                    />
                    <Button onClick={this.search.bind(this)}>查询</Button>
                </div>
                <PanelTable text="角色列表"
                            align="center"
                            isLoading={isLoadingRoleList}
                            loadingText="正在获取角色列表信息"
                >
                    <Table>
                        <thead>
                            <tr>
                                <th >
                                    角色名称
                                </th>
                                <th>
                                    权限说明
                                </th>
                            </tr>
                        </thead>
                        <Table.Body>
                            {
                                roleList && roleList.map((t, i)=> {
                                    return (
                                        <tr key={i}>
                                            <td >
                                                {t.Name}
                                            </td>
                                            <td>{t.Brief}</td>
                                        </tr>
                                    )
                                })
                            }
                        </Table.Body>
                    </Table>
                    {(!roleList || !roleList.length) && <h5 className="text-center">未查询或没有查询到结果</h5>}
                </PanelTable>
                <br/>
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
            </div>
        )
    }
}
module.exports = RoleManage;