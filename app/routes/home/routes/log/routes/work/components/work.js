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


export default class WorkLog extends BaseComponent {
    constructor() {
        super(...arguments);
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        let selectStates = new SelectState([
            ['work',{options:[{name:'全部',value:'全部'},{name:'空调',value:staticType.capacityType.control},{name:'照明',value:staticType.capacityType.switch}],value:'全部',allowEmpty:false,placeholder:'全部'}],
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
            sns:'',
            isLoadingWorkList: true,
            workLogList:[],
            pageParams: {
                current: 1,
                total: 0
            },
            page: 1,
        }
        this.pageSize = 20;
    }

    workSetSelectState(type,obj,cb) {
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
        let {groupId,selectStates,sns,workObj,page,pageParams} = this.state;
        pageParams.current = page;
        this.setState({
            isLoadingWorkList: true,
            workLogList:[],
            pageParams: pageParams,
        });
        let pageSize = this.pageSize;
        let postData={
            Ltype:staticType.logType.work,
            GroupId:groupId,
            Start:moment(selectStates.getSelect('start').value).format(),
            End:moment(selectStates.getSelect('end').value).format(),
            OperatorName:sns,
            ObjType:selectStates.getSelect('work').value,
            ObjName:workObj
        };
        this.workListRP = apis.log.getLogList(postData,(page - 1) * pageSize, pageSize);
        this.registerRequest(this.workListRP.request);
        this.workListRP.promise
            .then((res)=> {
                let data = res[0].Data || [];
                pageParams.total = res[1].Count||data.length ||0;
                let option = selectStates.getSelect('work').options;
                data.length&&data.map(item=>{
                    let objType='';
                    objType = option.map(o=>{if(o.value == item.ObjType)return o.name})
                    item.ObjType =  objType;
                })
                this.setState({
                    isLoadingWorkList: false,
                    workLogList:data,
                    pageParams: pageParams
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingWorkList: false,
                    });
                }
            })
    }


    componentDidMount(){
        this.search()
    }

    render() {
        const {isLoadingWorkList,selectStates,sns,workObj,workLogList,pageParams} = this.state;
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
                                            对象类型：
                                            <MySelect onChange={(obj)=>{this.workSetSelectState('work',obj);}}
                                                {...selectStates.getSelect('work')} style={{maxWidth:'130px'}}>
                                                {selectStates.getSelect('work').open&&
                                                <SelectList {...selectStates.getSelect('work')}
                                                    onChange={(obj,cb)=>{this.workSetSelectState('work',obj,cb)}}
                                                />}
                                            </MySelect>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            操作对象：
                                            <Input
                                                style={{maxWidth:'130px'}}>
                                                <input
                                                    value={workObj}
                                                    placeholder="输入名称搜索"
                                                    onChange={(e)=>{this.setState({workObj:e.target.value})}}/></Input>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p>开始时间：</p>
                                            <DateSelect {...selectStates.getSelect('start')}
                                                className="distanceX"
                                                placeholder="选择起始日期"
                                                endWith="day"
                                                onChange={(obj)=>{this.workSetSelectState('start',obj);}}/>
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
                                                                this.workSetSelectState('end',obj);}}/>
                                        </td>
                                    </tr>
                                  
                                    <tr>
                                        <td style={{textAlign:'center'}}>
                                            <Button className="condition-button"  onClick={()=>this.search()}>查询</Button>
                                        </td>
                                    </tr>
                                </Table.Body>

                            </Table>
                        </SideConditionChild>
                    </SideCondition>
                    <div className="sem-main-content"  >

                        <PanelTable text="运行日志列表"
                                    align="center"
                                    isLoading={isLoadingWorkList}
                                    loadingText="正在获取运行日志列表信息"
                        >

                            {
                                !isLoadingWorkList&& <Table>
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
                                            操作对象
                                        </th>
                                        <th>
                                            对象类型
                                        </th>
                                        <th>
                                            操作内容
                                        </th>
                                    </tr>
                                    </thead>
                                    <Table.Body>
                                        {
                                            workLogList && workLogList.map((t, i)=> {
                                                return (
                                                    <tr key={i}>
                                                        <td>{i+1}</td>
                                                        <td >{t.OperatorName}</td>
                                                        <td>{t.Time}</td>
                                                        <td>{t.ObjName}</td>
                                                        <td>{t.ObjType}</td>
                                                        <td>{t.Content}</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </Table.Body>
                                </Table>
                            }
                            {(!workLogList || !workLogList.length) && <h5 className="text-center">未查询或没有查询到结果</h5>}
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
module.exports = WorkLog;