/**
 * 创建于：6/8/16
 * 创建人：qizhang
 * 说明：管理员列表选择 支持所有和单个区域
 */
import React from 'react'
import BaseComponent from '../basecomponent'
import DropDownSelect from 'dropdownselect'
import apis from 'apis'

class CommunitySelect extends BaseComponent {
    constructor() {
        super(...arguments);
        this.state = {
            mangerList: [],
            isLoading: false
        }
    }

    /**
     * 加载小区
     */
    loadManger(communityID) {
        if(communityID){
            this.managerRP = apis.community.getCommunityManagerList(communityID);
        }
        else{
            this.managerRP = apis.usermanage.getUserList();
        }
        this.registerRequest(this.managerRP.request);
        this.setState({
            isLoading: true,
            isLoadFailed: false
        });
        this.managerRP.promise
            .then((res)=> {
                let data = res.Data || [];
                let list = data.map((c)=> {
                    return {
                        name: c.Name,
                        value: c.Id
                    }
                });

                this.setState({
                    mangerList: list,
                    isLoading: false
                });

                if(this.props.autoSelect && this.props.onChange && data[0]){
                    if(this.props.multiple) {
                        this.props.onChange([list[0].value]);
                    }
                    else{
                        this.props.onChange(list[0].value);
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
        if (this.state.isLoadFailed && !this.state.isLoading && !this.state.mangerList.length) {
            this.loadManger();
        }
    }

    componentWillReceiveProps(props) {
        if (props.cid !== this.props.cid) {
            this.loadManger(props.cid);
        }
    }

    componentDidMount() {
        this.loadManger(this.props.cid);
    }

    render() {
        return (
            <DropDownSelect {...this.props}
                placeholder={this.props.placeholder||"不限"}
                label={this.props.label?"管理员":null}
                inline={true}
                options={this.state.mangerList}
                onOpen={()=>this.handleOpen()}
                isLoading={this.state.isLoading}
                isLoadFailed={this.state.isLoadFailed}
            />
        )
    }
}

CommunitySelect.defaultProps = {
    label: true,
    autoSelect: true
};

export default CommunitySelect
