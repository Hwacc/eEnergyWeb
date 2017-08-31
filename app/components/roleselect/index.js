/**
 * Created by whj on 2016/6/20.
 */
import React from 'react'
import BaseComponent from '../basecomponent'
import DropDownSelect from 'dropdownselect'
import apis from 'apis'
class RoleSelect extends BaseComponent {
    constructor() {
        super(...arguments);
        this.state = {
            roleSelectList: [],
            isLoading: false
        };
    }

    loadRole() {
        this.roleListRP = apis.rolemanage.roleList();
        this.registerRequest(this.roleListRP.request);
        this.setState({
            isLoading: true,
            isLoadFailed: false
        });
        this.roleListRP.promise
            .then((res)=> {
                let data = res.Data;
                let dataList= [];
                for (var i = 0, length = data.length; i < length; i++) {
                    var obj = data.pop();
                    if (obj.Id != 2 && obj.Id != 6) {
                        obj.value = obj.Id;
                        obj.name = obj.Name;
                        dataList.push(obj)
                    }
                }
                this.setState({
                    roleSelectList: dataList,
                    isLoading: false
                })
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoading: false,
                        isLoadFailed: true
                    })
                }
            })
    }

    handleOpen() {
        if (this.state.isLoadFailed && !this.state.isLoading && !this.state.communityList.length) {
            this.loadRole();
        }
    }
    componentDidMount() {
        this.loadRole();
    }
    render() {
        return (
            <DropDownSelect {...this.props}
                placeholder={this.props.placeholder||"不限"}
                label={this.props.label?"角色列表":null}
                inline={true}
                options={this.state.roleSelectList}
                onOpen={()=>this.handleOpen()}
                isLoading={this.state.isLoading}
                isLoadFailed={this.state.isLoadFailed}
            />
        )
    }
}
RoleSelect.defaultProps = {
    label: false,
    autoSelect: true,
    allowEmpty: false
};

export default RoleSelect