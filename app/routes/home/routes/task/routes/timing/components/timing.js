
import {Input} from 'redux-components/formcontrol'
import {TreeList,Tree} from 'redux-components/treeList'
import apis from 'apis'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
import {SideCondition,SideConditionChild} from 'redux-components/side-condition'
import PreLoader from 'preloader'
import * as staticType from 'utils/staticType'
import moment from 'moment'
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import PanelTable from 'redux-components/paneltable'
import Table from 'redux-components/table'
import Button from 'redux-components/button'
import store from 'store'
import { getParentNode} from 'utils'
import Icons from 'icons'
import AddModal from './addmodal'
import EditModal from './editmodal'
import auth from 'auth'

export default class Timing extends BaseComponent {
    constructor(){
        super(...arguments);
        let selectStates = new SelectState([
            ['community',{}],
            //deviceType 写死
            ['devicesType',{options:[{name:'空调',value:2},{name:'照明',value:1}],value:2,allowEmpty:false,placeholder:'全部'}],
            ['activationType',{options:[{name:'全部',value:null},{name:'激活',value:staticType.taskStatusType.active},{name:'关闭',value:staticType.taskStatusType.off}],allowEmpty:false,placeholder:'全部'}]
        ]);
        
        this.state={
            //selects
            selectStates:selectStates,
            isLoadingTimeTask: true,
            timeTaskData: [],
            isShowAddModal:false,
            isShowEditModal:false,
            isDeletingTimeTask: false,
            isTurnOnOffTimeTask: false,
            modifyTaskId:null,
            userInfo:auth.getUser(),
            userId:null,
        }
    }

    timeSetSelectState(type,obj,cb) {
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

    /*获取区域管理列表*/
    getCommunityData(){
        let list  = this.props.list
        let {selectStates} = this.state;
        if(list.length>0){
            let communityId = store.get('communityId');
            let val = communityId||(list[0]?list[0].value:null);
            val = !selectStates.getSelect('community').multiple? val:[{value:val}];
          /*  this.getUseList(val)*/
            this.timeSetSelectState('community',{
                options: list,
                isLoading: false,
                value:val,
            },()=>this.search());
        }
    }

    getUseList(c){
        this.useListRP && this.useListRP.request.abort();
        this.useListRP = apis.energyInfo.getUseList(c);
        this.registerRequest(this.useListRP.request);
        this.useListRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                let list =[];
                if(data.length ==0){
                    list.unshift({value:'全部',name:'全部'});
                }else{
                    data.map(d=>{
                        list.push({value:d,name:d})
                    })
                }
                let deviceTypeValue =  list.length&&list[0].value;
                this.timeSetSelectState('devicesType',{
                    options: list,
                    isLoading:false,
                    value: deviceTypeValue
                });
            })

            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                }
                
            })
    }
    
    search(){
        let {selectStates} = this.state;
        this.setState({
            isLoadingTimeTask: true,
            timeTaskData: []
        });
        let postData={
            ttype: 0,
            ctype:selectStates.getSelect('devicesType').value,
            state:selectStates.getSelect('activationType').value,
        };
        this.taskInfoRankRP && this.taskInfoRankRP.request.abort();
        this.taskInfoRankRP = apis.task.getTaskList(postData);
        this.registerRequest(this.taskInfoRankRP.request);
        this.taskInfoRankRP.promise
            .then((res)=> {
                this.setState({
                    isLoadingTimeTask: false,
                    timeTaskData: res.Data || []
                });

            })
            .catch((err)=> {
                if (!err.abort) {
                    this.setState({
                        isLoadingTimeTask: false
                    });
                    alert(err.msg);
                }
            });
    }
    deleteTask(id){
        this.setState({
            isDeletingTimeTask: true,
        });
        this.taskDeleteRP && this.taskDeleteRP.request.abort();
        this.taskDeleteRP = apis.task.deleteTask(id);
        this.registerRequest(this.taskDeleteRP.request);
        this.taskDeleteRP.promise
            .then((res)=> {
                alert('删除定时任务成功！')
                this.setState({
                    isDeletingTimeTask: false,
                },()=>this.search());

            })
            .catch((err)=> {
                if (!err.abort) {
                    this.setState({
                        isDeletingTimeTask: false
                    });
                    alert(err.msg);
                }
            });
    }
    onOffTask(status,id){
        this.setState({
            isTurnOnOffTimeTask: true,
        });
        
        this.taskTurnOnOffRP && this.taskTurnOnOffRP.request.abort();
        this.taskTurnOnOffRP = apis.task.onOffTask(id,status);
        this.registerRequest(this.taskTurnOnOffRP.request);
        this.taskTurnOnOffRP.promise
            .then((res)=> {
                if(status ==staticType.taskStatusType.active){
                    alert('激活定时任务成功！')
                }else{
                    alert('关闭定时任务成功！')
                }
                
                this.setState({
                    isTurnOnOffTimeTask: false,
                },()=>this.search());

            })
            .catch((err)=> {
                if (!err.abort) {
                    this.setState({
                        isTurnOnOffTimeTask: false
                    });
                    alert(err.msg);
                }
            });
    }

    hideEditModal() {
        this.setState({
            isShowEditModal: false,
            isLoadingDeviceDetail: false,
            isShowAddModal:false
        });
    }

    componentDidMount(){
        this.getCommunityData();
    }

    render() {
        const {selectStates,isLoadingTimeTask,isShowAddModal,isShowEditModal,timeTaskData,modifyTaskId,userInfo,userId} = this.state;
       
        return (
            <div>
            <div className="sem-has-middle-bar" onClick={()=>this.timeSetSelectState(null,{open:false})}>
                <SideCondition callback={()=>this.search()}>
                    <SideConditionChild  className="search" text="查询条件"  height="40%">
                        <Table align="left" noborder={true}>
                            <Table.Body className="side-search">
                                <tr>
                                    <td>
                                        定时对象：
                                        <MySelect onChange={(obj)=>{this.timeSetSelectState('devicesType',obj);}}
                                            {...selectStates.getSelect('devicesType')} style={{maxWidth:'130px'}}>
                                            {selectStates.getSelect('devicesType').open&&
                                            <SelectList {...selectStates.getSelect('devicesType')}
                                                onChange={(obj,cb)=>{this.timeSetSelectState('devicesType',obj,cb)}}
                                            />}
                                        </MySelect>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        定时状态：
                                        <MySelect onChange={(obj)=>{this.timeSetSelectState('activationType',obj);}}
                                            {...selectStates.getSelect('activationType')} style={{maxWidth:'130px'}}>
                                            {selectStates.getSelect('activationType').open&&
                                            <SelectList {...selectStates.getSelect('activationType')}
                                                onChange={(obj,cb)=>{this.timeSetSelectState('activationType',obj,cb)}}
                                            />}
                                        </MySelect>
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
                <div className="sem-main-content" onClick={()=>this.timeSetSelectState(null,{open:false})} >
                    <div className="table-wrapper" style={{height:'850px',backgroundColor:'#fff'}}>
                        <PanelTable text="定时任务"
                                    align="center"
                                    isLoading={isLoadingTimeTask}
                                    loadingText="正在获取数据"
                        >
                            {
                                !isLoadingTimeTask&&
                                    <div>
                                        <div className="table-need-head">
                                            <Table>
                                                <thead>
                                                <tr>
                                                    <th>定时名称</th>
                                                    <th>定时开时间</th>
                                                    <th>定时关时间</th>
                                                    <th>定时状态</th>
                                                    <th>操作</th>
                                                </tr>
                                                </thead>
                                                <Table.Body>
                                                    {
                                                        timeTaskData.map((item,index)=>{
                                                            return(
                                                                <tr key={index}>
                                                                    <td>{item.Name}</td>
                                                                    <td>{item.TimingParam.StartTime?moment(new Date(item.TimingParam.StartTime)).format('HH:mm'):'无'}</td>
                                                                    <td>{item.TimingParam.EndTime?moment(new Date(item.TimingParam.EndTime)).format('HH:mm'):'无'}</td>
                                                                    <td>
                                                                        <Table.Operate image={item.TaskState==staticType.taskStatusType.active?Icons.choose:Icons.unChoose}text="激活"
                                                                                       onClick={()=>{if(item.TaskState==staticType.taskStatusType.off){this.onOffTask(staticType.taskStatusType.active,item.Id);}}}
                                                                        />
                                                                        <Table.Operate image={item.TaskState==staticType.taskStatusType.off?Icons.choose:Icons.unChoose} text="关闭"
                                                                                       onClick={()=>{if(item.TaskState ==staticType.taskStatusType.active){this.onOffTask(staticType.taskStatusType.off,item.Id);}}}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <Table.Operate image={Icons.modify} text="修改"
                                                                                       onClick={()=>this.setState({isShowEditModal:true,c})}
                                                                        />
                                                                        <Table.Operate image={Icons.delete} text="删除" disabled={item.UserId!==userInfo.Id}
                                                                                       onClick={()=>{this.deleteTask(item.Id)}}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                    
                                                </Table.Body>
                                            </Table>

                                        </div>
                                        <div className="table-need-body" style={{maxHeight:'805px'}}>
                                            <Table>
                                                <thead>
                                                <tr>
                                                    <th>定时名称</th>
                                                    <th>定时开时间</th>
                                                    <th>定时关时间</th>
                                                    <th>定时状态</th>
                                                    <th>操作</th>
                                                </tr>
                                                </thead>
                                                <Table.Body>
                                                    {
                                                        timeTaskData.map((item,index)=>{
                                                            return(
                                                                <tr key={index}>
                                                                    <td>{item.Name}</td>
                                                                    <td>{item.TimingParam.StartTime?moment(new Date(item.TimingParam.StartTime)).format('HH:mm'):'无'}</td>
                                                                    <td>{item.TimingParam.EndTime?moment(new Date(item.TimingParam.EndTime)).format('HH:mm'):'无'}</td>
                                                                    <td>
                                                                        <Table.Operate image={item.TaskState==staticType.taskStatusType.active?Icons.choose:Icons.unChoose}text="激活"
                                                                                       disabled={item.UserId!==userInfo.Id}
                                                                                       onClick={()=>{if(item.TaskState==staticType.taskStatusType.off){this.onOffTask(staticType.taskStatusType.active,item.Id);}}}
                                                                        />
                                                                        <Table.Operate image={item.TaskState==staticType.taskStatusType.off?Icons.choose:Icons.unChoose} text="关闭"
                                                                                       disabled={item.UserId!==userInfo.Id}
                                                                                       onClick={()=>{if(item.TaskState ==staticType.taskStatusType.active){this.onOffTask(staticType.taskStatusType.off,item.Id);}}}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <Table.Operate image={Icons.modify} text="修改"
                                                                                       onClick={()=>this.setState({isShowEditModal:true,modifyTaskId:item.Id,userId: item.UserId})}
                                                                        />
                                                                        <Table.Operate image={Icons.delete} text="删除" disabled={item.UserId!==userInfo.Id}
                                                                                       onClick={()=>{this.deleteTask(item.Id)}}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    }

                                                </Table.Body>
                                            </Table>

                                        </div>
                                        <Button type="outline"
                                                hasAddOn={true}
                                                onClick={()=>{
                                        this.setState({isShowAddModal:true});
                                    }}
                                                style={{border:'0',margin:'7px'}}
                                        >
                                            <Button.AddOn style={{height:12,width:12,marginTop: -5}} src={Icons.addTask}
                                            />
                                            新建任务
                                        </Button>
                                    </div>
                            }
                           
                        </PanelTable>
                        <br/>
                    </div>
                </div>
          
            </div>


                {
                    isShowEditModal&& <EditModal hideEditModal={()=>this.hideEditModal()}
                                               id = {selectStates.getSelect('community').value}
                                               taskId={modifyTaskId}
                                               search={()=>this.search()}
                    />
                }
                {
                    isShowAddModal&& <AddModal hideEditModal={()=>this.hideEditModal()}
                                               id = {selectStates.getSelect('community').value}
                                               type={selectStates.getSelect('devicesType').value}
                                               search={()=>this.search()}
                    />
                }
            </div>
        )
    };
}

module.exports = Timing;
