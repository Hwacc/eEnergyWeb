/**
 * 创建于：2016-6-13
 * 创建人：杨骐彰
 * 说明： 修改分组模态框
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'redux-components/rmodal'
import Table from 'redux-components/table'
import {Input} from 'redux-components/formcontrol'
import PanelTable from 'redux-components/paneltable'
import Button from 'redux-components/button'
import Pagination from 'redux-components/pagination'
import Checkbox from 'redux-components/checkbox'
import apis from 'apis'

export default class AddModal extends BaseComponent {
    constructor(props) {
        super(...arguments);
        this.state = {
            isShow: false,
            groupDetail: null,
            //是否正在加载详情
            isLoadingDetail: false,
            //添加分组是否正在加载设备列表
            isLoadingDevices: false,
            //添加分组设备列表
            deviceList: null,
            //添加当前分组设备列表是否被全选
            allChecked: false,
            //分页参数
            pageParams: {
                current: 1,
                total: 0
            },
        };
        //添加分组被选中的设备id列表
        this.selectDeviceIds = [];

        this.pageSize = 10;
    }

    componentWillMount(){
        this.loadGroupDevice();
        const openAnimation = ()=>this.setState({isShow:true});
        setTimeout(openAnimation,0)
    }

    /**
     * 获取添加分组区域设备列表
     */
    loadCommunityDevices(page) {
        let c = this.props.currentGroupId;
        page || (page = 1);
     
        this.communityDeviceRP && this.communityDeviceRP.request.forEach((r)=>r.abort());
        this.state.pageParams.current = page;
        this.setState({
            isLoadingDevices: true,
            pageParams: this.state.pageParams
        });
    
        this.communityDeviceRP = apis.device.getDeviceListWithRange((page - 1) * this.pageSize, this.pageSize, '', '', c);
        this.registerRequest(this.communityDeviceRP.request);
        this.communityDeviceRP.promise
            .then((res)=> {
                let data = res[0].Data || [];
                //检查data是否已经被选中
                let isAllChecked = true;
                data.forEach((d)=> {
                    let _has = this.selectDeviceIds.some((id)=> {
                        if (d.Id === id) {
                            d.Checked = true;
                            return true;
                        }
                    });
                    if (!_has) {
                        isAllChecked = false;
                    }
                });
                this.state.pageParams.total = res[1].Count;
                this.setState({
                    deviceList: data,
                    isLoadingDevices: false,
                    pageParams: this.state.pageParams,
                    allChecked: isAllChecked
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingDevices: false,
                        deviceList: null
                    });
                }
            })
    }

    /**
     * 处理添加分组分组名更改
     * @param val
     */
    handleGroupNameChange(val) {
        this.state.groupDetail.Name = val;
        this.setState({
            groupDetail: this.state.groupDetail
        });
    }


    /**
     * 处理单个设备被选中
     * @param device
     */
    handleCheckStateChange(device) {
        device.Checked = !device.Checked;
        this.checkSelectDeviceIds(device);
        let allChecked = this.state.deviceList.every((d)=>d.Checked);
        this.setState({
            allChecked: allChecked,
            deviceList: this.state.deviceList
        });
    }

    /**
     * 更新被选中ids
     * @param device
     */
    checkSelectDeviceIds(device) {
        let selectDeviceIds = this.selectDeviceIds;
        //如果没有被选中就切除已选中
        let has = selectDeviceIds.some((id, index)=> {
            if (id === device.Id) {
                if (!device.Checked) {
                    selectDeviceIds.splice(index, 1);
                }
                return true;
            }
        });
        !has && selectDeviceIds.push(device.Id);
    }

    /**
     * 全选或反选
     */
    handleAllCheckStateChange() {
        if (this.state.deviceList) {
            this.state.deviceList.forEach((d)=> {
                d.Checked = !this.state.allChecked;
                this.checkSelectDeviceIds(d);
            });
        }

        this.setState({
            allChecked: !this.state.allChecked,
            deviceList: this.state.deviceList
        });
    }

    /**
     * 提交修改分组
     */
    submitEdit() {
        const {groupDetail} = this.state;
        if (!groupDetail || !groupDetail.Name.trim()) {
            return alert('分组名不能为空');
        }
        modalLoading({key:'editGroup', content:'正在添加，请稍等...'})
        this.editGroupRP && this.editGroupRP.request.abort();
        var _group = Object.assign({Id:groupDetail.Id,Name:groupDetail.Name}, {
            Devices: this.selectDeviceIds.map((s)=> {
                return {
                    Id: s
                }
            })
        });
        this.editGroupRP = apis.group.editGroup(_group);
        this.registerRequest(this.editGroupRP.request);
        this.editGroupRP.promise
            .then(()=> {
                //关闭弹窗
                this.handleClose();
                //刷新
                this.props.onChanged();
                alert('修改成功');
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                }
            })
            .done(()=> {
                closeLoading('editGroup')
            })
    }

    /**
     * 处理关闭
     */
    handleClose() {
        this.setState({
            isShow: false
        });
        setTimeout(this.props.hideEditModal,300);
    }

    /**
     * 获取分组详情
     */
    loadGroupDevice() {
        let group = this.props.groupInfo;
        this.groupDetailRP && this.groupDetailRP.request.forEach((r)=>r.abort());
        this.setState({
            isLoadingDetail: true
        });
        this.groupDetailRP = apis.group.getGroupDetailByID(group.Id);
        this.registerRequest(this.groupDetailRP.request);
        this.groupDetailRP.promise
            .then((res)=> {
                let data = res.Data;
                data.Devices.map((d)=> {
                    this.selectDeviceIds.push(d.Id);
                });
                this.loadCommunityDevices(1);
                this.setState({
                    groupDetail: data,
                    isLoadingDetail: false
                })
            })
            .catch((err)=> {
                if (!err.abort) {
                    this.setState({
                        isLoadingDetail: false,
                        isLoadingDetailFailed: true,
                        loadingDetailFailedText: err.msg
                    });
                }
            })
    }
    
    render() {
        const {isShow,groupDetail,isLoadingDetail,isLoadingDetailFailed,loadingDetailFailedText,deviceList,isLoadingDevices,groupName,community,allChecked,manager,pageParams} = this.state;
        const _style = {marginRight: 15};
        return (
            <Modal width="680" show={isShow}>
                <Modal.Header text="分组详情" onClose={()=>this.handleClose()}/>
                <Modal.Content style={{height:500,overflowY:'auto'}}

                >
                    <div className="distanceY">
                        <span style={_style}>
                            <span style={_style}>分组名称</span>
                            <Input size="thin"
                                   style={{width:120}}
                            >
                                <input
                                    onChange={(e)=>this.handleGroupNameChange(e.target.value)}
                                    value={groupDetail?groupDetail.Name:''}

                                />
                            </Input>
                        </span>
                    </div>
                    <PanelTable showHeader={false}
                                isLoading={isLoadingDevices}
                    >
                        <Table>
                            <thead>
                                <tr>
                                    <th className="text-left">
                                        <Checkbox checked={allChecked} onClick={()=>this.handleAllCheckStateChange()}/>
                                        设备名称
                                    </th>
                                    <th>
                                        设备类型
                                    </th>
                                    <th>
                                        设备地址
                                    </th>
                                </tr>
                            </thead>
                            <Table.Body>
                                {
                                    deviceList && deviceList.map((d, i)=> {
                                        return (
                                            <tr key={i}>
                                                <td className="text-left">
                                                    <Checkbox checked={d.Checked}
                                                              onClick={()=>this.handleCheckStateChange(d)}/>
                                                    {d.Nick}
                                                </td>
                                                <td>{d.TypeName}</td>
                                                <td>{d.Address}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </Table.Body>
                        </Table>
                        {(!deviceList || !deviceList.length) && <h5 className="text-center">未查询或没有查询到结果</h5>}
                    </PanelTable>
                    <br />
                    <div className="clear-fix">
                        已选设备
                        <span style={{marginLeft:6}}
                              className="offline-color">
                            {this.selectDeviceIds.length}
                        </span>
                        <Pagination current={pageParams.current}
                                    total={pageParams.total}
                                    size={this.pageSize}
                                    onChange={(p)=>{this.loadCommunityDevices(p)}}
                        />
                    </div>
                </Modal.Content>
                <Modal.Footer>
                    <Button size="thin" type="outline" onClick={()=>this.handleClose()}>
                        取消
                    </Button>
                    <Button size="thin" onClick={()=>this.submitEdit()}>
                        确定
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

AddModal.propTypes = {
    onChanged: React.PropTypes.func.isRequired,
    onClose: React.PropTypes.func.isRequired
};