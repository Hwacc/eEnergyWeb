/**
 * Created by whj on 2016/7/2.
 * 说明：市下拉框
 */
import React from 'react'
import BaseComponent from '../basecomponent'
import DropDownSelect from '../dropdownselect'
import apis from 'apis'

class CitySelect extends BaseComponent {
    constructor() {
        super(...arguments);
        this.state = {
            cityList: [],
            isLoading: false
        };
    }

    /**
     * 加载省
     */
    loadCommunity() {
        let id=this.props.id
        this.cityRP = apis.address.getCity(id);
        this.registerRequest(this.cityRP.request);
        this.setState({
            isLoading: true,
            isLoadFailed: false
        });
        this.cityRP.promise
            .then((res)=> {
                let data = res.Data || [];
                let list = data.map((c)=> {
                    return {
                        name: c.Name,
                        value: c.Id
                    }
                });
                this.setState({
                    cityList: list,
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
        let {value} = this.props
        return (
            <DropDownSelect {...this.props}
                value = {value}
                placeholder={this.props.placeholder||"不限"}
                label={this.props.label?"市":null}
                inline={true}
                options={this.state.cityList}
                onOpen={()=>this.handleOpen()}
                isLoading={this.state.isLoading}
                isLoadFailed={this.state.isLoadFailed}
            />
        )
    }
}

CitySelect.defaultProps = {
    label: true,
    autoSelect: true,
    allowEmpty: false
};

export default CitySelect