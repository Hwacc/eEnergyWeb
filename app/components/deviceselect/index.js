/**
 * Created by whj57 on 2016/11/17.
 */
import React from 'react'
import BaseComponent from '../basecomponent'
import DropDownSelect from 'dropdownselect'
import apis from 'apis'

class DeviceSelect extends BaseComponent {
    constructor() {
        super(...arguments);
        this.state = {
            groupList: [],
            isLoading: false
        }
    }

    /**
     * 加载设备
     */
    loadGroup(id) {
        this.groupRP && this.groupRP.request.abort();
        this.groupDetailRP && this.groupDetailRP.request.abort();
        if (!id && id != 0)return;
        this.setState({
            isLoading: true,
            groupList: null,
            isLoadFailed: false
        });
        this.groupRP = apis.device.getDeviceList(undefined,undefined,id);
        this.registerRequest(this.groupRP.request);
        this.groupRP.promise
            .then((res)=> {
                let data = res.Data || [];
                let list = data.map((c)=> {
                    return {
                        name: c.DevieNick,
                        value: c.Id
                    }
                });
                this.setState({
                    groupList: list,
                    isLoading: false
                });

                if (this.props.autoSelect) {
                    if (this.props.multiple) {
                        this.props.onChange(list[0] ? [list[0].value] : []);
                    }
                    else {
                        this.props.onChange(list[0] ? list[0].value : null);
                    }
                }
            })
            .catch((err)=> {
                if (!err.abort) {
                    this.setState({
                        isLoading: false,
                        isLoadFailed: true
                    });
                }
            })
    }

    handleOpen() {
        if (this.state.isLoadFailed && !this.state.isLoading && (!this.state.groupList || !this.state.groupList.length)) {
            this.loadGroup(this.props.cid);
        }
    }

    componentDidMount() {
        const {cid} = this.props;
        this.loadGroup(cid);
    }

    componentWillReceiveProps(props) {
        if (props.cid !== this.props.cid) {
            this.loadGroup(props.cid);
        }
    }

    render() {
        return (
            <DropDownSelect {...this.props}
                            placeholder={this.props.placeholder||"不限"}
                            label={this.props.label?"设备":null}
                            inline={true}
                            options={this.state.groupList}
                            onOpen={()=>this.handleOpen()}
                            isLoading={this.state.isLoading}
                            isLoadFailed={this.state.isLoadFailed}
            />
        )
    }
}

DeviceSelect.defaultProps = {
    label: true,
    autoSelect: true
};

export default DeviceSelect