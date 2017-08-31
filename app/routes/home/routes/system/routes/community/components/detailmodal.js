/**
 * 创建于：2016-6-13
 * 创建人：杨骐彰
 * 说明： 分组详情模态框
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'redux-components/rmodal'
import PanelTable from 'redux-components/paneltable'
import Table from 'redux-components/table'
import Pagination from 'redux-components/pagination'
import Button from 'redux-components/button'
import apis from 'apis'

export default class DetailModal extends BaseComponent {
    constructor() {
        super(...arguments);
        this.state = {
            //是否显示，默认是
            isShow: false,
            //是否正在加载
            isLoading: true,
            //当前页设备列表
            deviceList: [],
            //分页参数
            pageParams: {
                current: 1,
                total: 0
            }
        };
        this.pageSize = 10;
    }

    /**
     * 获取分组详情
     * @param page
     */
    loadGroupDevice(page) {
        let group = this.props.groupInfo;
        page || (page = 1);
        this.groupDeviceRP && this.groupDeviceRP.request.forEach((r)=>r.abort());
        this.state.pageParams.current = page;
        this.setState({
            isLoading: true,
            pageParams: this.state.pageParams
        });
        this.groupDeviceRP = apis.device.getDeviceListWithRange((page - 1) * this.pageSize, this.pageSize, '', '', group.Id);
        this.registerRequest(this.groupDeviceRP.request);
        this.groupDeviceRP.promise
            .then((res)=> {
                let data = res[0].Data || [];
                this.state.pageParams.total = res[1].Count;
                this.setState({
                    deviceList: data,
                    isLoading: false,
                    pageParams: this.state.pageParams
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoading: false,
                        deviceList: null
                    });
                }
            })
    }

    componentWillMount() {
        const openAnimation = ()=>this.setState({isShow:true});
        setTimeout(openAnimation,0)
        this.loadGroupDevice(1);
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

    render() {
        const {onClose,groupInfo} = this.props;
        const {pageParams,deviceList,isLoading,isShow} = this.state;
        const _style = {
            padding: '0 35px 16px 0'
        };
        return (
            <Modal width="680" show={isShow} >
                <Modal.Header text="分组详情" onClose={()=>this.handleClose()}/>
                <Modal.Content style={{height:500,overflowY:'auto'}}
                >
                    {groupInfo && <table>
                        <tbody>
                            <tr>
                                <td style={_style}>
                                    分组名称
                                </td>
                                <td style={_style}>{groupInfo.Name}</td>
                            </tr>
                        </tbody>
                    </table>
                    }
                    <PanelTable showHeader={false}
                                isLoading={isLoading}
                    >
                        <Table>
                            <thead>
                                <tr>
                                    <th>
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
                                                <td>
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
                            {pageParams.total}
                        </span>
                        <Pagination current={pageParams.current}
                                    total={pageParams.total}
                                    size={this.pageSize}
                                    onChange={(p)=>{this.loadGroupDevice(p)}}
                        />
                    </div>
                </Modal.Content>
                <Modal.Footer >
                    <Button size="thin" onClick={()=>this.handleClose()}>
                        确定
                    </Button>
                </Modal.Footer >
            </Modal >
        )
    }
}

DetailModal.propTypes = {
    groupInfo: React.PropTypes.object.isRequired,
    onClose: React.PropTypes.func.isRequired
};