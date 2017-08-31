/**
 * Created by whj on 2016/7/4.
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'redux-components/rmodal'
import Table from 'redux-components/table'
import {Input} from 'redux-components/formcontrol'
import apis from 'apis'
import Button from 'redux-components/button'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
export default class AddModal extends BaseComponent{
    constructor(props){
        super(...arguments);
        let selectStates = new SelectState([
            ['province',{}],
            ['city',{}],
            ['district',{}]
            ]);
        this.state={
            isShow:false,
            editableData:this.getEditableData(),
            isSave:false,
            isLoadingCommunityDetail:false,
            isLoadingCommunityDetailFailed: false,
            loadingFailedText: null,
            userDetailInfo:null,
            selectStates:selectStates,
        }
    }
    communitySetSelectState(type,obj,cb) {
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
    //获取省数据
    loadProvince() {
        this.provinRP && this.provinRP.request.abort()
        this.provinRP = apis.address.getProvince();
        this.registerRequest(this.provinRP.request);
        this.communitySetSelectState('province',{
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
                this.communitySetSelectState('province',{
                    options: list,
                    isLoading: false,
                    value:list[0].value
                });
                this.handleEditableDataChange('Province',list[0].value)
                this.loadCity(list[0].value)

            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.communitySetSelectState('province',{
                        isLoading: false,
                        isLoadFailed: true
                    });
                }
            })
    }
    //获取市区数据
    loadCity(id) {
        this.cityRP && this.cityRP.request.abort()
        this.cityRP = apis.address.getCity(id);
        this.registerRequest(this.cityRP.request);
        this.communitySetSelectState('city',{
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
                this.communitySetSelectState('city',{
                    options: list,
                    isLoading: false,
                    value:list[0].value
                });
                this.loadDistrict((list[0].value));
                this.handleEditableDataChange('City',list[0].value)

            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.communitySetSelectState('city',{
                        isLoading: false,
                        isLoadFailed: true
                    });
                }
            })
    }
    //获取区域数据
    loadDistrict(id) {
        this.districtRP && this.districtRP.request.abort()
        this.districtRP = apis.address.getDistrict(id);
        this.registerRequest(this.districtRP.request);
        this.communitySetSelectState('district',{
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
                this.communitySetSelectState('district',{
                    options: list,
                    isLoading: false,
                    value:list[0].value
                });
                this.handleEditableDataChange('District',list[0].value)

            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.communitySetSelectState('district',{
                        isLoading: false,
                        isLoadFailed: true
                    });
                }
            })
    }
    getEditableData(community) {
        if (community) {
            return {
                Name: community.Name || '',
                Brief: community.Brief || '',
                Province:community.Province||'',
                City:community.City||'',
                District:community.District||'',
                Size: community.Size || '',
                Address: community.Address||''
            }
        }
        //重置
        else {
            return {
                Name: '',
                Brief:  '',
                Province:'',
                City:'',
                District:'',
                Size: '',
                Address: ''
            }
        }
    }
    handleEditableDataChange(key, value) {
        let {editableData} = this.state;
        editableData[key] = value;
        this.setState({
            editableData: editableData
        });
    }
    componentWillMount(){
        const openAnimation = ()=>this.setState({isShow:true});
        setTimeout(openAnimation,0);
        this.loadProvince()
    }
    /**
     * 保存添加更改
     */
    savingAdd() {
        this.communityAddRP && this.communityAddRP.request.abort();
        let {editableData} = this.state;
        //保存角色信息
        this.communityAddRP = apis.group.addGroup(editableData);
        this.registerRequest(this.communityAddRP.request);
        this.communityAddRP.promise
            .then((res)=> {
                this.handleClose();
                this.props.search();
                alert('添加成功')
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                }
            })
    }
    handleClose() {
        this.setState({
            isShow: false
        });
        setTimeout(this.props.hideEditModal,300);
    }
    render(){
        const {editableData,isLoadingCommunityDetailFailed,loadingFailedText,isLoadingCommunityDetail,isShow,
            selectStates} = this.state;
        const {hideEditModal}=this.props
        return(
            <Modal width="450" show={isShow} onClick={()=>this.communitySetSelectState(null,{open:false})}>
                <Modal.Header text="添加小区信息" onClose={()=>this.handleClose()}/>

                <Modal.Content isLoading={isLoadingCommunityDetail}
                               loadingText="正在获取详情"
                               isLoadingFailed={isLoadingCommunityDetailFailed}
                               loadingFailedText={loadingFailedText}
                >
                    <Table align="left"
                           noborder={true}>
                        <Table.Body>
                            <tr>
                                <td style={{width:"5em"}}>小区名称</td>
                                <td>
                                    <Input size="thin"
                                           block={true}
                                           style={{width:130}}
                                    >
                                        <input
                                            value={editableData.Name}
                                            onChange={(e)=>this.handleEditableDataChange('Name',e.target.value)}
                                        />
                                    </Input>
                                </td>
                            </tr>
                            {
                                <tr>
                                    <td>省</td>
                                    <td>
                                        <MySelect onChange={(obj)=>this.communitySetSelectState('province',obj)}
                                                  {...selectStates.getSelect('province')}
                                                  className="condition-search">
                                            {selectStates.getSelect('province').open&&
                                            <SelectList {...selectStates.getSelect('province')}
                                                        onChange={(obj,cb)=>{this.communitySetSelectState('province',obj,()=>{
                                                            this.loadCity(obj.value);
                                                            this.handleEditableDataChange('Province',obj.value)
                                                        });}}
                                            />}
                                        </MySelect>
                                    </td>
                                </tr>
                            }
                            {
                                <tr>
                                    <td>市</td>
                                    <td>
                                        <MySelect onChange={(obj)=>this.communitySetSelectState('city',obj)}
                                                  {...selectStates.getSelect('city')}
                                                  className="condition-search">
                                            {selectStates.getSelect('city').open&&
                                            <SelectList {...selectStates.getSelect('city')}
                                                        onChange={(obj,cb)=>{this.communitySetSelectState('city',obj,()=>{
                                                            this.loadDistrict(obj.value);
                                                            this.handleEditableDataChange('City',obj.value)
                                                        });}}
                                            />}
                                        </MySelect>
                                    </td>
                                </tr>
                            }
                            {
                                <tr>
                                    <td>区</td>
                                    <td>
                                        <MySelect onChange={(obj)=>this.communitySetSelectState('district',obj)}
                                                  {...selectStates.getSelect('district')}
                                                  className="condition-search">
                                            {selectStates.getSelect('district').open&&
                                            <SelectList {...selectStates.getSelect('district')}
                                                        onChange={(obj,cb)=>{this.communitySetSelectState('district',obj,()=>{
                                                            this.handleEditableDataChange('District',obj.value)
                                                        });}}
                                            />}
                                        </MySelect>
                                    </td>
                                </tr>
                            }
                            <tr>
                                <td>详细地址</td>
                                <td>
                                    <Input style={{width:130}}
                                           size="thin"
                                           block={true}
                                    >
                                        <input
                                            value={editableData.Address}
                                            onChange={(e)=>this.handleEditableDataChange('Address',e.target.value)}
                                        />
                                    </Input>
                                </td>
                            </tr>
                            <tr>
                                <td>面积</td>
                                <td>
                                    <Input style={{width:130}}
                                           size="thin"
                                           block={true}
                                    >
                                        <input
                                            value={editableData.Size}
                                            onChange={(e)=>this.handleEditableDataChange('Size',e.target.value)}
                                        />
                                    </Input>
                                </td>
                            </tr>
                            <tr>
                                <td>备注</td>
                                <td>
                                        <textarea
                                            style={{height:150,width:290,boxSizing:"border-box",border:"1px solid#52caff",borderRadius:4,
                                            marginTop: "1px"}}
                                            onChange={(e)=>this.handleEditableDataChange('Brief',e.target.value)}
                                            value={editableData["Brief"]}
                                        />
                                </td>
                            </tr>
                        </Table.Body>
                    </Table>
                    <p>
                    </p>
                    <div className="text-center">
                        <Button size="thin" type="outline" style={{width:100,marginRight:50}}
                                onClick={()=>this.handleClose()}>取消
                        </Button>
                        <Button size="thin" style={{width:100}} onClick={this.savingAdd.bind(this)}>保存</Button>
                    </div>
                </Modal.Content>

            </Modal>
        )
    }
}