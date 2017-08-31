/**
 * 创建于：6/8/16
 * 创建人：qizhang
 * 说明：分组列表选择
 */
import React from 'react'
import BaseComponent from '../basecomponent'
import DropDownSelect from 'dropdownselect'
import apis from 'apis'

class GroupSelect extends BaseComponent {
    constructor() {
        super(...arguments);
        this.state = {
            groupList: [],
            isLoading: false
        }
    }

    /**
     * 加载分组
     */
    loadGroup(id) {
        this.groupRP && this.groupRP.request.abort();
        if (!id && id != 0)return;
        this.setState({
            isLoading: true,
            groupList: null,
            isLoadFailed: false
        });
        this.groupRP = apis.group.getGroupListByCommunityID(id);
        this.registerRequest(this.groupRP.request);
        this.groupRP.promise
            .then((res)=> {
                let data = res.Data || [];
                let list = data.map((c)=> {
                    return {
                        name: c.Name,
                        value: c.Id
                    }
                });
                this.setState({
                    groupList: list,
                    isLoading: false
                });
                if (this.props.autoSelect) {
                    if (this.props.multiple) {
                        this.props.onChange(list[0] ? [list[0].value] : [],list[0] ? [list[0].name] : []);
                    }
                    else {
                        this.props.onChange(list[0] ? list[0].value : null,list[0] ? list[0].name : null);
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
            });
        
    }

    handleOpen(props) {
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
                label={this.props.label?"设备分组":null}
                inline={true}
                options={this.state.groupList}
                onOpen={()=>this.handleOpen()}
                isLoading={this.state.isLoading}
                isLoadFailed={this.state.isLoadFailed}
            />
           
        )
    }
}

GroupSelect.defaultProps = {
    label: true,
    autoSelect: true
};

export default GroupSelect
