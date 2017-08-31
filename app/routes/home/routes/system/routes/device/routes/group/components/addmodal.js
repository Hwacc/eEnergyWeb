/**
 * 创建于：2016-6-13
 * 创建人：杨骐彰
 * 说明： 添加分组模态框
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'redux-components/rmodal'
import PanelTable from 'redux-components/paneltable'
import Table from 'redux-components/table'
import Button from 'redux-components/button'
import Checkbox from 'redux-components/checkbox'
import Pagination from 'redux-components/pagination'
import {Input} from 'redux-components/formcontrol'
import apis from 'apis'
import auth from 'auth'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'

export default class AddModal extends BaseComponent {
    constructor(props) {
        
        let fatherGroupName = '';
        props.list.map(i=>{
            if(i.value==props.currentGroupId){
                fatherGroupName = i.name
            }
        })
        let selectStates = new SelectState([
            ['community',{value:props.currentGroupId,
                options:[{value:props.currentGroupId,name:fatherGroupName}]}],
            ['userList',{multiple:true}]
        ]);
        super(...arguments);
        this.state = {
            isShow: false,
            //添加分组名称
            groupName: '',
            //添加分组区域
            community: '',
            //管理员
            manager: '',
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
            user:auth.getUser(),
            currentGroupId:props.currentGroupId,
            fatherGroupName:fatherGroupName,
            selectStates:selectStates,


        };
        //添加分组被选中的设备id列表
        this.selectDeviceIds = [];

        this.pageSize = 10;
    }
    groupAddSetSelectState(type,obj,cb) {
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
    componentWillMount(){
        const openAnimation = ()=>this.setState({isShow:true});
        setTimeout(openAnimation,0);
        this.loadCommunityDevices(this.state.currentGroupId);
        this.getUserData()
    }

    /*获取管理员列表*/
    getUserData(){
        let {selectStates,currentGroupId} = this.state;
        this.getUserRP&&this.getUserRP.request.abort();
        this.getUserRP = apis.usermanage.getUserList('',currentGroupId);
        this.groupAddSetSelectState('userList',{
            isLoading:true,
            isFailed:false
        });
        this.registerRequest(this.getUserRP.request);
        this.getUserRP.promise
            .then((res)=> {
                let data = res.Data || [];
                let list =[];
                data.map((c)=> {
                    list.push({name: c.Username, value: c.Id})
                });
                let val = list[1]?list[1].value:null;
                val = !selectStates.getSelect('userList').multiple? val:[{value:val}];
                this.groupAddSetSelectState('userList',{
                    options: list,
                    isLoading: false,
                    value:val,
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.groupAddSetSelectState('userList',{
                        isLoading:false,
                        isFailed:true
                    });
                }
            })

    }
    /**
     * 获取添加分组区域设备列表
     * @param c
     */
    loadCommunityDevices(c, page) {
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
     * 处理添加分组区域更改
     * @param c
     */
    handleCommunityChange(c) {
        this.setState({
            allChecked: false,
            community: c,
            selectDeviceIds: []
        });
        this.loadCommunityDevices(c);
    }

    /**
     * 处理添加分组分组名更改
     * @param val
     */
    handleGroupNameChange(val) {
        this.setState({
            groupName: val
        });
    }

    /**
     * 处理管理员更改
     * @param val
     */
    handleManagerChange(val) {
        this.setState({
            manager: val
        })
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
     * 添加分组方法
     */
    handleAdd() {
        const {groupName,selectStates} = this.state;
        const {groupType} = this.props
        if (!groupName.trim()  ) {
            return alert('分组名，区域，管理员不能为空');
        }
        modalLoading({key:'addGroup', content:'正在添加，请稍等...'})
        this.addGroupRP && this.addGroupRP.request.abort();
        this.addGroupRP = apis.group.addGroup({
            Devices: this.selectDeviceIds.map((d)=> {
                return {Id: d}
            }),
            Name:groupName,
            FatherGroup:selectStates.getSelect('community').value,
            ManagerIds:selectStates.getSelect('userList').value.map(i=>i.value),
            GroupType:groupType
        });
        this.registerRequest(this.addGroupRP.request);
        this.addGroupRP.promise
            .then((res)=> {
                //关闭弹窗
                this.handleClose();
                //刷新
                this.props.onAdded();
                alert('添加成功');
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                }
            })
            .done(()=> {
                closeLoading('addGroup')
            })
    }

    /**
     * 处理关闭
     */
    handleClose() {
        this.setState({
            isShow: false
        });
        setTimeout(this.props.onClose,300);
    }

    render() {
        const {isShow,deviceList,isLoadingDevices,groupName,community,allChecked,pageParams,selectStates,currentGroupId} = this.state;
        const _style = {marginRight: 15};
        return (
            <Modal width="680" show={isShow}  onClick={()=>this.groupAddSetSelectState(null,{open:false})}>
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
                                    value={groupName}
                                    onChange={(e)=>this.handleGroupNameChange(e.target.value)}
                                />
                            </Input>
                        </span>
                        <span style={_style}>
                            <span style={_style}>所在区域</span>
                            <MySelect onChange={(obj)=>this.groupAddSetSelectState('community',obj)}
                                      {...selectStates.getSelect('community')}
                                      style={{maxWidth:'130px'}}>
                                            {selectStates.getSelect('community').open&&
                                            <SelectList {...selectStates.getSelect('community')}
                                                        onChange={(obj,cb)=>{this.groupAddSetSelectState('community',obj,cb);
                                                            this.loadCommunityDevices(obj.value);}}
                                            />}
                                        </MySelect>
                        </span>
                        { <span style={_style}>
                            <span style={_style}>管理员</span>
                            <MySelect onChange={(obj)=>this.groupAddSetSelectState('userList',obj)}
                                      {...selectStates.getSelect('userList')}
                                      style={{maxWidth:'130px'}}>
                                            {selectStates.getSelect('userList').open&&
                                            <SelectList {...selectStates.getSelect('userList')}
                                                        onChange={(obj,cb)=>{this.groupAddSetSelectState('userList',obj,cb);}}
                                            />}
                                        </MySelect>

                        </span>
                        }
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
                                    onChange={(p)=>{this.loadCommunityDevices(currentGroupId,p)}}
                        />
                    </div>
                </Modal.Content>
                <Modal.Footer>
                    <Button size="thin" type="outline" onClick={()=>this.handleClose()}>
                        取消
                    </Button>
                    <Button size="thin" onClick={()=>this.handleAdd()}>
                        确定
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

AddModal.propTypes = {
    onAdded: React.PropTypes.func.isRequired,
    onClose: React.PropTypes.func.isRequired
};