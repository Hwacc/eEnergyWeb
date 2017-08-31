/**
 * 创建于：2016-6-13
 * 创建人：杨骐彰
 * 说明： 设备分组页面
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'modal'
import PanelTable from 'redux-components/paneltable'
import Table from 'redux-components/table'
import Button from 'redux-components/button'
import {Input} from 'redux-components/formcontrol'
import PreLoader from 'redux-components/preloader'
import apis from 'apis'
import moment from 'moment'
import config from '../../../../../../../config'
import icons from 'icons'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
import {SideCondition,SideConditionChild} from 'redux-components/side-condition'
import {TreeList,Tree} from 'redux-components/treeList'
import store from 'store'
import './style.scss'
import {getParentNode} from 'utils'
import ChooseBar from 'redux-components/choose-bar'
import {DateSelect,DateSelectState} from 'redux-components/dropdownselect/datepicker'
import FrontBackCharts from './front-back-charts'
import HourCompareCharts from './hour-compare-charts'
import DeviceListBar from 'redux-components/device-list-bar'


class FrontBack extends BaseComponent {
    constructor() {
        super(...arguments);
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate()-1;
        let selectStates = new SelectState([['community',{}]]);
        let dateStates = new DateSelectState([
            ['start',{value:moment(new Date(year,month,day)).add(-10,'day').toDate(),isMini:false,endWith:'day'}],
            ['end',{value:moment(new Date(year,month,day)).add(1,'day').add(-1,'second').toDate(),isMini:false,endWith:'day'}]
        ]);
        dateStates.subMap(selectStates.getSelects());
        this.state = {
            //分组名称
            groupName: '',
            //管理区域
            community: null,
            //是否正在查询
            isLoadingGroupList: false,
            //分组列表
            groupList: null,
            //显示详情modal
            isShowDetailModal: false,
            //显示新建modal
            isShowAddModal: false,
            //当前选中的分组
            activeGroupInfo: null,
            currentGroupId:1,
            treeData:null,
            isLoadedGroup: false,
            groupAllList:[],
            checkedIds:[],
            isLoadingDeviceList:false,
            deviceList:[],
            selectStates:dateStates,
            isLoadingDayInfo:false,
            isLoadingDeviceInfo:false,
            dayDeviceInfo:[],
            deviceInfo:[],
            hourInfo:{},
            isLoadingHourInfo:false,
            afterReformed:{},
            beforeReformed:{},
            
        }

    }

    frontBackSetSelectState(type,obj,cb) {
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
    /*获取分组*/
    getGroupData(id){
        this.groupRP && this.groupRP.request.abort();
        if (!id && id == 0)return;
        this.groupRP = apis.group.getGroupListByCommunityID(id);
        this.registerRequest(this.groupRP.request);
        this.setState({
            isLoadingGroup:true,
            treeData:[],
            currentGroupId:id,
        });
        this.groupRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                let treeTop={};
                data.map((d,i)=>{
                    if(d.Id == id){
                        treeTop = d;
                        data.splice(i,1)
                    }
                })
                let list = data.map((c)=> {
                    let catalog = c.Path.split('/');
                    catalog.pop();
                    catalog.shift();
                    catalog.push(c.Id)
                    catalog = catalog.join('|');
                    return {
                        name: c.Name,
                        value: c.Id,
                        catalog:catalog,
                        groupType:c.GroupType
                    }
                });
                const dataTree = new Tree(list)
                const treeData = dataTree.init({name:treeTop.Name,value:treeTop.Id});
                this.setState({
                    isLoadingGroup:false,
                    treeData:treeData
                },()=>this.search())

            })
            .catch((err)=> {
                if (!err.abort) {
                   /* alert(err.msg);*/
                    this.setState({
                        isLoadingGroup:false
                    })

                }
            })
    }
    handleTreeList(item){
        let data = this.state.treeData;
        data = Tree.setShow(item,data);
        this.setState({treeData:data})
    }
    componentDidMount(){
        let id = store.get('communityId')
        this.getGroupData(id)

    }
    /*获取区域管理列表*/
    getCommunityData(){
        let {selectStates} = this.state;
        this.communityRP&&this.communityRP.request.abort();
        this.communityRP = apis.group.getGroupListByCommunityID();
        this.frontBackSetSelectState('community',{
            isLoading:true,
            isFailed:false
        });
        this.setState({
            isLoadingGroup:true,
            treeData:[],
        });
        this.registerRequest(this.communityRP.request);
        this.communityRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                let list = getParentNode(data);
                let communityId = store.get('communityId');
                let val = communityId||(list[0]?list[0].value:null);
                val = !selectStates.getSelect('community').multiple? val:[{value:val}];
                this.getGroupData(val);
                this.frontBackSetSelectState('community',{
                    options: list,
                    isLoading: false,
                    value:val,
                });
                this.setState({
                    groupAllList:data
                })
            })
            .catch((err)=> {
                if (!err.abort) {
                  /*  alert(err.msg);*/
                    this.frontBackSetSelectState('community',{
                        isLoading:false,
                        isFailed:true
                    });
                }
            })
    }
    /**
     * 查询
     */
    search(id) {
        const {currentGroupId} = this.state;
        this.deviceRP && this.deviceRP.request.abort();
        this.setState({
            isLoadingDeviceList: true
        });
        let postData = {
            gid: id || currentGroupId,
            reform: 1
        };
        this.deviceRP = apis.energyimprovement.getEnergyDevice(postData);
        this.registerRequest(this.deviceRP.request);
        this.deviceRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                this.setState({
                    deviceList: data,
                    isLoadingDeviceList: false
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    /*alert(err.msg);*/
                    this.setState({
                        isLoadingGroupList: false
                    });
                }
            })



    }
    //获取日用能
    getDayInfo(data){
        this.energyDayRP && this.energyDayRP.request.abort();
        this.setState({
            isLoadingDayInfo: true,
            dayDeviceInfo:[],
        });
        this.energyDayRP = apis.energyimprovement.getEnergyDay(1,data);
        this.registerRequest(this.energyDayRP.request);
        this.energyDayRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                this.setState({
                    dayDeviceInfo: data,
                    isLoadingDayInfo: false
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                 /*   alert(err.msg);*/
                    this.setState({
                        isLoadingDayInfo: false
                    });
                }
            });
       
    }
    //获取空调信息
    getDeviceInfo(data){

        this.energyAirConditionRP && this.energyAirConditionRP.request.abort();
        this.setState({
            isLoadingDeviceInfo: true,
            deviceInfo:[]
        });
        this.energyAirConditionRP = apis.energyimprovement.getEnergyAirCondition(1,data)
        this.registerRequest(this.energyAirConditionRP.request);
        this.energyAirConditionRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                this.setState({
                    deviceInfo: data[0],
                    isLoadingDeviceInfo: false
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    /*alert(err.msg);*/
                    this.setState({
                        isLoadingDeviceInfo: false
                    });
                }
            })
    }
    //获取小时用能
    getHourInfo(data){
        this.energyHourInfoRP && this.energyHourInfoRP.request.abort();
        this.setState({
            isLoadingHourInfo: true,
            hourInfo:{},
            afterReformed:{},
            beforeReformed:{}
        });
        this.energyHourInfoRP = apis.energyimprovement.getEnergyHour(1,data)
        this.registerRequest(this.energyHourInfoRP.request);
        this.energyHourInfoRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                data.length&&data.map(t=>{
                    if(t.IsReformed){
                        this.setState({afterReformed:t});
                    }else{
                        this.setState({beforeReformed:t});
                    }
                });
                this.setState({
                    hourInfo: data[0],
                    isLoadingHourInfo: false
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                   /* alert(err.msg);*/
                    this.setState({
                        isLoadingHourInfo: false
                    });
                }
            })
    }

    
    compare(){
        const {deviceList,selectStates} = this.state;
        let checkedDevices = []
        deviceList.map(d=>{
            if(d.checked){
                checkedDevices.push(d)
            }
        });
        let id =[];
        if(!checkedDevices.length){
            alert('请选择对比设备')
        }else{
            checkedDevices.map(t=>{
                if(t.checked){
                    id.push(t.DeviceId);
                }
            })
        }
        let postData = {
            Ids: id,
            StartTime: moment(selectStates.getSelect('start').value).format('YYYY-MM-DD HH:mm:ss'),
            EndTime: moment(selectStates.getSelect('end').value).format('YYYY-MM-DD HH:mm:ss'),
        };
        this.getDayInfo(postData);
        this.getDeviceInfo(postData);
        this.getHourInfo(postData);
    }
    
    render() {
        let {selectStates,community,isLoadingDeviceList,groupList,
            activeGroupInfo,treeData,isLoadingGroup,currentGroupId,groupAllList,checkedIds,hourInfo,isLoadingHourInfo,
            deviceList,dayDeviceInfo,isLoadingDayInfo,deviceInfo,isLoadingDeviceInfo,afterReformed,beforeReformed} = this.state;
        
        let beforeHourAve = beforeReformed.HourAvePower?beforeReformed.HourAvePower.toFixed(2):0;
        let afterHourAve = afterReformed.HourAvePower?afterReformed.HourAvePower.toFixed(2):0;
        let hourChartsData =[beforeHourAve,afterHourAve];
        return (
            <div>

                <div className="sem-has-middle-bar frontback" onClick={()=>this.frontBackSetSelectState(null,{open:false})}>
                    <SideCondition >
                        <SideConditionChild className="list" text="选择区域" height="40%">

                            <div className="group-condition-wrapper" style={{padding:'0'}} >

                                {isLoadingGroup?<PreLoader/>
                                    : <TreeList data={treeData} onClick={(item)=>this.handleTreeList(item)}
                                                handleCheck={(val)=>{this.setState({currentGroupId:val},()=>this.search(val))}}
                                                value={currentGroupId}/>}
                            </div>
                        </SideConditionChild>
                        <SideConditionChild className="list" text="选择设备">
                            <div>
                                <DeviceListBar data={deviceList} isSingle={true} isLoading={isLoadingDeviceList} onChange={(list)=>this.setState({deviceList:list})}/>
                            </div>
                        </SideConditionChild>
                    </SideCondition>
                    <div className="sem-main-content">
                        <div className="wrapper">

                            <div className="sem-main-tool">
                                <ChooseBar data={deviceList}  onChange={(ids)=>{this.setState({deviceList:ids})}}>
                                    <div>
                                        <span style={{marginRight:36}}>选择对比时间：</span>
                                        <DateSelect {...selectStates.getSelect('start')}
                                            className="distanceX"
                                            placeholder="选择起始日期"
                                            endWith="day"
                                            onChange={(obj)=>{ this.frontBackSetSelectState('start',obj);}}/>
                                        <span style={{color:'#52caff',marginRight:10}}>-</span>
                                        <DateSelect {...selectStates.getSelect('end')}
                                            className="distanceX"
                                            placeholder="选择起始日期"
                                            endWith="day"
                                            onChange={(obj)=>{
                                                                if(obj.value){
                                                                    obj.value = moment(obj.value).add(1,'day').add(-1,'second').toDate()
                                                                }
                                                                this.frontBackSetSelectState('end',obj);}}/>
                                        
                                        <Button type="thin" style={{marginLeft:20,fontSize:14}}
                                        onClick={()=>this.compare()}>开始对比</Button>

                                    </div>
                                </ChooseBar>
                            </div>
                            <div className="sem-main-top">
                                <div className="sem-main-top-title">单位：kWh</div>
                                {
                                        isLoadingDeviceInfo?<PreLoader show={true} text="正在获取用电信息"/>
                                            :
                                                (dayDeviceInfo.length?<FrontBackCharts  data={dayDeviceInfo} deviceInfo={deviceInfo}/>
                                                    :
                                                    <div style={{
                                                        backgroundImage:`url(${icons.noDevice})`,
                                                        width: 190,
                                                        height:156,
                                                        position:'relative',
                                                        top: '50%',
                                                        left: '50%',
                                                        marginLeft:-95,
                                                        marginTop:-78 }}></div>  
                                                    )
                                }
                            </div>



                            <div className="sem-main-middle">
                                        <PanelTable text="设备改造前后对比"
                                                    align="center"
                                                    loadingText="正在获取数据"
                                        >
                                            <Table>
                                                <thead>
                                                <tr>
                                                    <Table.Th className="large">设备参数</Table.Th>
                                                    <Table.Th className="min">改造前</Table.Th>
                                                    <Table.Th className="min">改造后</Table.Th>
                                                </tr>
                                                </thead>
                                                <Table.Body>
                                                    <tr>
                                                        <td>空调品牌号</td>
                                                        <td colSpan="2">  {deviceInfo.BrandModel?deviceInfo.BrandModel:'无'}</td>

                                                    </tr>
                                                    <tr>
                                                        <td>制冷量</td>
                                                        <td colSpan="2">{deviceInfo.CoolCapacity?deviceInfo.CoolCapacity:0}W</td>
                                                    </tr>
                                                    <tr>
                                                        <td>地理环境</td>
                                                        <td colSpan="2">{deviceInfo.LocationCondition?deviceInfo.LocationCondition:'无'}</td>
                                                        
                                                    </tr>
                                                    <tr>
                                                        <td>建筑信息</td>
                                                        <td colSpan="2">{deviceInfo.BuildingInfo?deviceInfo.BuildingInfo:'无'}</td>
                                                        
                                                    </tr>
                                                    <tr>
                                                        <td>改造时间</td>
                                                        <td colSpan="2">{deviceInfo.ReformDate?moment(deviceInfo.ReformDate).format('YYYY年MM月DD日 HH:mm:ss'):'无'}</td>
                                                        
                                                    </tr>
                                                    <tr>
                                                        <td>制冷剂</td>
                                                        <td>{deviceInfo.OldRefrigerant?deviceInfo.OldRefrigerant:'无'}</td>
                                                        <td>{deviceInfo.NewRefrigerant?deviceInfo.NewRefrigerant:'无'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>开启时长</td>
                                                        <td>{beforeReformed.OnHour?beforeReformed.OnHour.toFixed(2):0}h</td>
                                                        <td>{afterReformed.OnHour?afterReformed.OnHour.toFixed(2):0}h</td>
                                                    </tr>
                                                    <tr>
                                                        <td>平均气温</td>
                                                        <td>{deviceInfo.OldAveTemperature?deviceInfo.OldAveTemperature:0}℃</td>
                                                        <td>{deviceInfo.NewAveTemperature?deviceInfo.NewAveTemperature:0}℃</td>
                                                    </tr>
                                                    <tr>
                                                        <td>总用电量</td>
                                                        <td>{beforeReformed.Power?beforeReformed.Power.toFixed(2):0}kWh</td>
                                                        <td>{afterReformed.Power?afterReformed.Power.toFixed(2):0}kWh</td>
                                                    </tr>
                                                    <tr>
                                                        <td>每小时用电量</td>
                                                        <td>{beforeHourAve}kWh</td>
                                                        <td>{afterHourAve}kWh</td>
                                                    </tr>
                                                </Table.Body>
                                            </Table>
                                        </PanelTable>
                            </div>
                            <div className="sem-main-bottom">
                                <div className="left">
                                    <div className="sem-main-top-title">
                                        <span style={{fontSize:16,fontWeight:'bold'}}> 改造前后每小时用电对比</span>
                                       <span style={{color:'#aaaaaa'}}> 单位：kWh</span>
                                    </div>
                                    {
                                        isLoadingHourInfo?<PreLoader />
                                            :<HourCompareCharts data={hourChartsData}/>
                                    }

                                </div>
                                <div className="right ">
                                    <div className="right-title">对比结果</div>
                                    
                                    {
                                        hourInfo.DeviceNick?(beforeHourAve&&afterHourAve?<div>
                                            <div className="item-icon"></div>
                                              <span>
                                                  改造设备{hourInfo.DeviceNick}改造前开启
                                                  {beforeReformed.OnHour?beforeReformed.OnHour.toFixed(2):0}小时，
                                                  总用电量{beforeReformed.Power?beforeReformed.Power.toFixed(2):0}kWh，
                                                  平均每小时用电{beforeHourAve}kWh；
                                                  改造后开启{afterReformed.OnHour?afterReformed.OnHour.toFixed(2):0}小时，
                                                  总用电量{afterReformed.Power?afterReformed.Power.toFixed(2):0}kWh，
                                                  平均每小时用电{afterHourAve}kWh，
                                                  减少了{(beforeHourAve-afterHourAve).toFixed(2)}kWh,
                                                  <span className="red">节电率达到了{(((beforeHourAve-afterHourAve) 
                                                  /afterHourAve)*100).toFixed(2)}%。</span>
                                              </span>
                                        </div> :<div></div>)

                                            :<div style={{
                                        backgroundImage:`url(${icons.noDevice})`,
                                        width: 190,
                                        height:156,
                                        position:'relative',
                                        top: '50%',
                                        left: '50%',
                                        marginLeft:-95,
                                        marginTop:-78
                                    }}>

                                        </div>
                                    }
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = FrontBack;