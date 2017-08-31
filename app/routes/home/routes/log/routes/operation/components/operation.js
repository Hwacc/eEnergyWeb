/**
 * Created by whj on 2016/7/4.
 */
import React from 'react'
import BaseComponent from 'basecomponent'
import PanelTable from 'redux-components/paneltable'
import Table from 'redux-components/table'
import Button from 'redux-components/button'
import {Input} from 'redux-components/formcontrol'
import PreLoader from 'redux-components/preloader'
import icons from 'icons'
import apis from 'apis'
import store from 'store'
import * as staticType from 'utils/staticType'
import './../../style.scss'
import {TreeList,Tree} from 'redux-components/treeList'
import {SideCondition,SideConditionChild} from 'redux-components/side-condition'
import {MySelect,SelectList,SelectState} from 'redux-components/dropdownselect'
import {DateSelect,DateSelectState} from 'redux-components/dropdownselect/datepicker'
import moment from 'moment'
import Pagination from 'pagination'


export default class OperationLog extends BaseComponent {
    constructor() {
        super(...arguments);
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        let selectStates = new SelectState([
            ['operation',{}],
        ]);
        let dateStates = new DateSelectState([
            ['start',{value:moment(new Date(year,month,day)).add(-10,'day').toDate(),isMini:true,endWith:'day'}],
            ['end',{value:moment(new Date(year,month,day)).add(1,'day').add(-1,'second').toDate(),isMini:true,endWith:'day'}]
        ]);
        dateStates.subMap(selectStates.getSelects());
        let id =  store.get('tree').value

        this.state = {
            groupId: id,
            selectStates:dateStates,
            isLoadingType: true,
            operationType:[],
            sns:'',
            isLoadingOperationList: true,
            operationLogList:[],
            pageParams: {
                current: 1,
                total: 0
            },
            page: 1,
        }
        this.pageSize = 20;
    }
   
    operationSetSelectState(type,obj,cb) {
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


    search() {
        let {groupId,selectStates,sns,page,pageParams} = this.state;
        pageParams.current = page;
       
        this.setState({
            isLoadingOperationList: true,
            operationLogList:[],
            pageParams: pageParams,
        });
        let pageSize = this.pageSize;
        let postData={
            Ltype:staticType.logType.operation,
            GroupId:groupId,
            Start:moment(selectStates.getSelect('start').value).format(),
            End:moment(selectStates.getSelect('end').value).format(),
            OperatorName:sns,
            OperType:selectStates.getSelect('operation').value
        };
        this.operationListRP = apis.log.getLogList(postData,(page - 1) * pageSize, pageSize);
        this.registerRequest(this.operationListRP.request);
        this.operationListRP.promise
            .then((res)=> {
                let data = res[0].Data || [];
                pageParams.total = res[1].Count||data.length ||0;
                let option = selectStates.getSelect('operation').options;
                data.length&&data.map(item=>{
                    let objType='';
                    objType = option.map(o=>{if(o.value == item.OType)return o.name})
                    item.OType =  objType;
                })
                this.setState({
                    isLoadingOperationList: false,
                    operationLogList:data,
                    pageParams: pageParams
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingOperationList: false,
                    });
                }
            })
    }
    getOperationType(){
        this.operationTypeRP && this.operationTypeRP.request.abort();
        this.setState({
            isLoadingType: true,
        });
        this.operationTypeRP = apis.log.getOperationType();
        this.registerRequest(this.operationTypeRP.request);
        this.operationTypeRP.promise
            .then((res)=> {
                let data = res.Data;
                let options=[{name:'全部',value:'全部'}];
                for(let key in data){
                    if (data.hasOwnProperty(key) === true){
                        options.push({
                            name: data[key],
                            value:key
                        })
                    }
                }
                let val = options[0]?options[0].value:''
                this.operationSetSelectState('operation',{
                    options:options,
                    value: val
               })
                this.setState({
                    isLoadingType: false,
                },()=>this.search());
            })
            .catch((err)=> {
                console.log(err)
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingType: false,
                    });
                }
            })
    }

    componentDidMount(){
        this.getOperationType()
    }

    render() {
        const {isLoadingOperationList,selectStates,sns,operationLogList,pageParams} = this.state;
        return (
            <div>
                <div className="sem-has-middle-bar  community">
                    <SideCondition >
                        <SideConditionChild  className="search" text="查询条件"  height="90%">
                            <Table align="left" noborder={true}>
                                <Table.Body className="side-search">
                                    <tr>
                                        <td>
                                            操作人员：
                                            <Input
                                                style={{maxWidth:'130px'}}>
                                                <input
                                                    value={sns}
                                                    placeholder="请输入操作人名称"
                                                    onChange={(e)=>{this.setState({sns:e.target.value})}}/></Input>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            操作类型：
                                            <MySelect onChange={(obj)=>{this.operationSetSelectState('operation',obj);}}
                                                {...selectStates.getSelect('operation')} style={{maxWidth:'130px'}}>
                                                {selectStates.getSelect('operation').open&&
                                                <SelectList {...selectStates.getSelect('operation')}
                                                    onChange={(obj,cb)=>{this.operationSetSelectState('operation',obj,cb);this.handleSearchTypeChange(obj)}}
                                                />}
                                            </MySelect>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p>开始时间：</p>
                                            <DateSelect {...selectStates.getSelect('start')}
                                                className="distanceX"
                                                placeholder="选择起始日期"
                                                endWith="day"
                                                onChange={(obj)=>{this.operationSetSelectState('start',obj);}}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p>结束时间：</p>
                                            <DateSelect {...selectStates.getSelect('end')}
                                                className="distanceX"
                                                placeholder="选择起始日期"
                                                endWith="day"
                                                onChange={(obj)=>{
                                                                if(obj.value){
                                                                    obj.value = moment(obj.value).add(1,'day').add(-1,'second').toDate()
                                                                }
                                                                this.operationSetSelectState('end',obj);}}/>
                                        </td>
                                    </tr>


                                    <tr>
                                        <td style={{textAlign:'center'}}>
                                            <Button className="condition-button"  onClick={this.search.bind(this)}>查询</Button>
                                        </td>
                                    </tr>
                                </Table.Body>

                            </Table>
                        </SideConditionChild>
                    </SideCondition>
                    <div className="sem-main-content"  >

                            <PanelTable text="操作日志列表"
                                        align="center"
                                        isLoading={isLoadingOperationList}
                                        loadingText="正在获取操作日志列表信息"
                            >
                                
                                {
                                    !isLoadingOperationList&& <Table>
                                        <thead>
                                        <tr>
                                            <th>
                                                序号
                                            </th>
                                            <th>
                                                操作人
                                            </th>
                                            <th>操作时间
                                            </th>
                                            <th>
                                                操作类型
                                            </th>
                                            <th>
                                                操作内容
                                            </th>
                                        </tr>
                                        </thead>
                                        <Table.Body>
                                            {
                                                operationLogList && operationLogList.map((t, i)=> {
                                                    return (
                                                        <tr key={i}>
                                                            <td>{i+1}</td>
                                                            <td >{t.OperatorName}</td>
                                                            <td>{t.Time}</td>
                                                            <td>{t.OType}</td>
                                                            <td>{t.Content}</td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </Table.Body>
                                    </Table>
                                }
                                {(!operationLogList || !operationLogList.length) && <h5 className="text-center">未查询或没有查询到结果</h5>}
                            </PanelTable>
                        <br/>
                        <div className="clear-fix">
                            <Pagination current={pageParams.current}
                                        total={pageParams.total}
                                        size={this.pageSize}
                                        onChange={(p)=>{
                                            this.setState({page:p},()=>this.search())
                                        }}
                            />
                        </div>
                    </div>
                    <br/>
                </div>
            </div>
        )
    }
}
module.exports = OperationLog;