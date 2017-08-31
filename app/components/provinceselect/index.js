/**
 * Created by whj on 2016/7/2.
 * 说明：获取省列表
 */
import React from 'react'
import BaseComponent from '../basecomponent'
import DropDownSelect from '../dropdownselect'
import apis from 'apis'


class ProvinceSelect extends BaseComponent {
    constructor() {
        super(...arguments);
        this.state = {
            provinceList: [],
            isLoading: false
        };
    }

    /**
     * 加载省
     */
    loadCommunity() {
        this.provinRP = apis.address.getProvince();
        this.registerRequest(this.provinRP.request);
        this.setState({
            isLoading: true,
            isLoadFailed: false
        });
        this.provinRP.promise
            .then((res)=> {
                let data = res.Data || [];
                let list = data.map((c)=> {
                    return {
                        name: c.Name,
                        value: c.Id
                    }
                });
                this.setState({
                    provinceList: list,
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
                    alert(err.msg);
                    this.setState({
                        isLoading: false,
                        isLoadFailed: true
                    });
                }
            })
    }

    handleOpen() {
        if (this.state.isLoadFailed && !this.state.isLoading && !this.state.provinceList.length) {
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
                label={this.props.label?"省":null}
                inline={true}
                options={this.state.provinceList}
                onOpen={()=>this.handleOpen()}
                isLoading={this.state.isLoading}
                isLoadFailed={this.state.isLoadFailed}
            />
        )
    }
}

ProvinceSelect.defaultProps = {
    label: true,
    autoSelect: true,
    allowEmpty: false
};

export default ProvinceSelect