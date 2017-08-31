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



export default class WarnLog extends BaseComponent {
    constructor() {
        super(...arguments);
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        let selectStates = new SelectState([
            ['warning',{options:[{name:'全部',value:'全部'},{name:'空调开启预警',value:staticType.capacityType.control},{name:'用电量预警',value:staticType.capacityType.measure}],value:'全部',allowEmpty:false,placeholder:'全部'}],
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
            isLoadingWarningList: true,
            warningLogList:[],
            pageParams: {
                current: 1,
                total: 0
            },
            page: 1,

        }
        this.pageSize = 20;
    }

    warningSetSelectState(type,obj,cb) {
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
        const {groupId,selectStates,sns,page,pageParams} = this.state;
        pageParams.current = page;
        this.setState({
            isLoadingWarningList: true,
            warningLogList:[]
        });
        let pageSize = this.pageSize;
        let postData={
            Ltype:staticType.logType.warn,
            GroupId:groupId,
            Start:moment(selectStates.getSelect('start').value).format(),
            End:moment(selectStates.getSelect('end').value).format(),
            ObjName:sns,
            ObjType:selectStates.getSelect('warning').value
        }
        this.warningListRP = apis.log.getLogList(postData,(page - 1) * pageSize, pageSize);
        this.registerRequest(this.warningListRP.request);
        this.warningListRP.promise
            .then((res)=> {
                let data = res[0].Data || [];
                pageParams.total = res[1].Count||data.length ||0;
                let option = selectStates.getSelect('warning').options;
                data.length&&data.map(item=>{
                    let objType='';
                    objType = option.map(o=>{if(o.value == item.ObjType)return o.name})
                    item.ObjType =  objType;
                })
                
                this.setState({
                    isLoadingWarningList: false,
                    warningLogList:data,
                    pageParams: pageParams
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingWarningList: false,
                    });
                }
            })
    }

    componentDidMount(){
       this.search();
    }
    
    render() {
        const {isLoadingWarningList,selectStates,sns,warningLogList,pageParams} = this.state;
        return (
            <div>
                <div className="sem-has-middle-bar  community">
                    <SideCondition >
                        <SideConditionChild  className="search" text="查询条件"  height="90%">
                            <Table align="left" noborder={true}>
                                <Table.Body className="side-search">
                                    <tr>
                                        <td>
                                            预警类型：
                                            <MySelect onChange={(obj)=>{this.warningSetSelectState('warning',obj);}}
                                                {...selectStates.getSelect('warning')} style={{maxWidth:'130px'}}>
                                                {selectStates.getSelect('warning').open&&
                                                <SelectList {...selectStates.getSelect('warning')}
                                                    onChange={(obj,cb)=>{this.warningSetSelectState('warning',obj,cb)}}
                                                />}

                                            </MySelect>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            预警设备：
                                            <Input
                                                style={{maxWidth:'130px'}}>
                                                <input
                                                    value={sns}
                                                    placeholder="请输入设备名称"
                                                    onChange={(e)=>{this.setState({sns:e.target.value})}}/></Input>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p>开始时间：</p>
                                            <DateSelect {...selectStates.getSelect('start')}
                                                className="distanceX"
                                                placeholder="选择起始日期"
                                                endWith="day"
                                                onChange={(obj)=>{this.warningSetSelectState('start',obj);}}/>
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
                                                                this.warningSetSelectState('end',obj);}}/>
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

                        <PanelTable text="预警日志列表"
                                    align="center"
                                    isLoading={isLoadingWarningList}
                                    loadingText="正在获取预警日志列表信息"
                        >
                            {
                                !isLoadingWarningList&&
                                        <Table>
                                            <thead>
                                            <tr>
                                                <th>
                                                    序号
                                                </th>
                                                <th>
                                                    预警类型
                                                </th>
                                                <th>
                                                    预警时间
                                                </th>
                                                <th>
                                                    预警设备
                                                </th>
                                            </tr>
                                            </thead>
                                            <Table.Body>
                                                {
                                                    warningLogList && warningLogList.map((t, i)=> {
                                                        return (
                                                            <tr key={i}>
                                                                <td>{i+1}</td>
                                                                <td >{t.ObjType}</td>
                                                                <td>{t.Time}</td>
                                                                <td>{t.ObjName}</td>

                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </Table.Body>
                                        </Table>
                            }
                            {(!warningLogList || !warningLogList.length) && <h5 className="text-center">未查询或没有查询到结果</h5>}
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
module.exports = WarnLog;