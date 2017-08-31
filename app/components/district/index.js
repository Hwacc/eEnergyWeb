/**
 * Created by whj on 2016/7/2.
 * 说明：区下拉框
 */
import React from 'react'
import BaseComponent from '../basecomponent'
import DropDownSelect from 'dropdownselect'
import apis from 'apis'

class DistrictSelect extends BaseComponent {
    constructor() {
        super(...arguments);
        this.state = {
            districtList: [],
            isLoading: false
        };
    }

    /**
     * 加载区
     */
    loadCommunity() {
        let id=this.props.id
        this.districtRP = apis.address.getDistrict(id);
        this.registerRequest(this.districtRP.request);
        this.setState({
            isLoading: true,
            isLoadFailed: false
        });
        this.districtRP.promise
            .then((res)=> {
                let data = res.Data || [];
                let list = data.map((c)=> {
                    return {
                        name: c.Name,
                        value: c.Id
                    }
                });

                this.setState({
                    districtList: list,
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
        this.loadCommunity();
    }

    componentDidMount() {
        this.loadCommunity();
    }

    render() {
        return (
            <DropDownSelect {...this.props}
                placeholder={this.props.placeholder||"不限"}
                label={this.props.label?"区":null}
                inline={true}
                options={this.state.districtList}
                onOpen={()=>this.handleOpen()}
                isLoading={this.state.isLoading}
                isLoadFailed={this.state.isLoadFailed}
            />
        )
    }
}

DistrictSelect.defaultProps = {
    label: true,
    autoSelect: true,
    allowEmpty: false
};

export default DistrictSelect