/**
 * 创建于：6/8/16
 * 创建人：qizhang
 * 说明：小区列表选择
 */
import React from 'react'
import BaseComponent from '../basecomponent'
import DropDownSelect from 'dropdownselect'
import apis from 'apis'
import store from 'store'

class CommunitySelect extends BaseComponent {
    constructor() {
        super(...arguments);
        this.state = {
            communityList: [],
            isLoading: false
        };
    }

    /**
     * 加载小区
     */
    loadCommunity() {
        this.communityRP = apis.community.getCommunityList();
        this.registerRequest(this.communityRP.request);
        this.setState({
            isLoading: true,
            isLoadFailed: false
        });
        this.communityRP.promise
            .then((res)=> {
                let data = res.Data || [];
                let list = data.map((c)=> {
                    return {
                        name: c.Name,
                        value: c.Id
                    }
                });

                this.setState({
                    communityList: list,
                    isLoading: false
                });
                let cid = store.get('communityId');
                if (this.props.autoSelect) {
                    if (this.props.multiple) {
                        this.props.onChange(list[0] ? [list[0].value] : []);
                    }
                    else {
                        cid?this.props.onChange(cid):this.props.onChange(list[0] ? list[0].value : null,list[0].name);
                    }
                }
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoading: false,
                        isLoadFailed: true
                    });
                }
            })
    }

    handleOpen() {
        if (this.state.isLoadFailed && !this.state.isLoading && !this.state.communityList.length) {
            this.loadCommunity();
        }
    }

    componentDidMount() {
        this.loadCommunity();
    }

    render() {
        return (
            <DropDownSelect {...this.props}
                placeholder={this.props.placeholder||"不限"}
                label={this.props.label?"管理区域":null}
                inline={true}
                options={this.state.communityList}
                onOpen={()=>this.handleOpen()}
                isLoading={this.state.isLoading}
                isLoadFailed={this.state.isLoadFailed}
            />
        )
    }
}

CommunitySelect.defaultProps = {
    label: true,
    autoSelect: true,
    allowEmpty: false
};

export default CommunitySelect
