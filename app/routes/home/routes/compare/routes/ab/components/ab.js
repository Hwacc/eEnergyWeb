/**
 * 创建于：2016-6-8
 * 创建人：杨骐彰
 * 说明：设备列表页
 */

import React from 'react'
import BaseComponent from 'basecomponent'
import PanelTable from 'redux-components/paneltable'
import Table from 'redux-components/table'
import Button from 'redux-components/button'
import Checkbox from 'redux-components/checkbox'
import {Input} from 'redux-components/formcontrol'
import PreLoader from 'redux-components/preloader'
import Modal from 'modal'
import Download from 'download'
import UpLoader from 'uploader'
import {TreeList,Tree} from 'redux-components/treeList'
import config from '../../../../../../../config'
import icons from 'icons'
import moment from 'moment'
import CompareChart from './all-area-charts'
import { staticType } from 'utils'
import apis from 'apis'
import store from 'store'
import {getParentNode} from 'utils'
import './style.scss'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
import Promise from 'q'
import {SideCondition,SideConditionChild} from 'redux-components/side-condition'
import ChooseBar from 'redux-components/choose-bar'
import {DateSelect,DateSelectState} from 'redux-components/dropdownselect/datepicker'
import './style.scss'
import HourCharts from './compare-charts'
import DeviceListBar from 'redux-components/device-list-bar'
import {Link} from 'react-router'

class AB extends BaseComponent {
    constructor() {
        super(...arguments);
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate()-1;
        let dateStates = new DateSelectState([
            ['start',{value:moment(new Date(year,month,day)).add(-10,'day').toDate(),isMini:false,endWith:'day',isRight:false}],
            ['end',{value:moment(new Date(year,month,day)).add(1,'day').add(-1,'second').toDate(),isMini:false,endWith:'day',isRight:true}]
        ]);
        
        this.state = {
            //设备条码
            sns: '',
            //小区
            community: '',
            //分组
            group: '',
            //是否正在加载列表
            isLoadingDeviceList: false,
            //设备列表
            deviceList: [],
            //显示编辑弹窗
            isShowEditModal: false,
            //是否正在加载详情
            isLoadingDeviceDetail: false,
            //弹窗类型 1：编辑 0：详情
            modalType: 1,
            //设备详情
            deviceDetailInfo: {},
            //设备可编辑信息
            //是否正在保存更改
            isSavingChange: false,
            //是否被全选
            allSelect: false,
            //是否开始下载
            downLoad:false,
            //上传
            uploader:false,
            //选中设备id
            //selects
            selectStates:dateStates,
            currentId:null,
            isShowInfoModal:false,
            isShowQRModal:false,
            isLoadedGroup: false,
            isFirst: true,
            currentGroupId:-1,
            treeData:null,
            currentNick: '',
            checkedIds:[],
            deviceDetailList:[],
            hourEnergyList:[]
        }
    }
    handleTreeList(){
        let data = this.state.treeData;
        this.setState({treeData:data});
        let {treeData} = this.state;
        treeData && treeData.map((t) => {
            if (t.value == this.state.currentGroupId) {
                this.setState({selectArea:t.name});
            }
        });
    }
    listSetSelectState(type,obj,cb) {
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



    /**
     * 获取设备列表
     */
    getDevicesList(){
        let currentGroupId = -1;
        let val = this.props.location.query.id;
        if(val){
            currentGroupId = val;
        }else {
            currentGroupId = this.state.currentGroupId;
        }
        this.deviceListRP && this.deviceListRP.request.abort();
        this.setState({
            currentGroupId:currentGroupId,
            isLoadingDeviceList:true,
            deviceList:[]
        })
        this.deviceListRP = apis.energyimprovement.getEnergyDevice({
            gid:currentGroupId
        })
        this.registerRequest(this.deviceListRP.request);
        this.deviceListRP.promise
            .then(res =>{
                this.setState({
                    deviceList:res.Data,
                    isLoadingDeviceList:false
                })
            })
            .catch(err => {
                if (!err.abort) {
                    alert(err.message);
                    this.setState({
                        deviceList: [],
                        isLoadingDeviceList:false
                    });
                }
            })
    }

    /**
     * 查询
     */
    search() {
        let {deviceList,selectStates,currentGroupId} = this.state
        this.deviceEnergyRP && this.deviceEnergyRP.request.abort()
        this.energyAirConditionRP && this.energyAirConditionRP.request.abort()
        // this.hourEnergyRP && this.hourEnergyRP.request.abort()
        this.setState({
            devicesChangeInfo:[],
            isLoadingDevicesChangeInfo:true,
            deviceDetailList:[],
            isLoadingDeviceDetailList:true,
            hourEnergyList:[],
            isLoadingHourEnergyList:true
        })
        let Ids = [];
        deviceList.map(d=>{
            if(d.checked){
                Ids.push(d.DeviceId) 
            }
        });
        if(Ids.length<2){
            this.setState({
                isLoadingDevicesChangeInfo:false,
                isLoadingDeviceDetailList:false,
                isLoadingHourEnergyList:false
            })
            alert('请选择两个及两个以上对比设备')
        }else if(Ids.length>6){
            this.setState({
                isLoadingDevicesChangeInfo:false,
                isLoadingDeviceDetailList:false,
                isLoadingHourEnergyList:false
            })
            alert('最多选择六个对比设备')
        }else{
            let params = {
                GroupId:currentGroupId,
                Form:staticType.timeBaseOnEnum.day,
                StartTime:moment(selectStates.getSelect('start').value).format('YYYY-MM-DD HH:mm:ss'),
                EndTime:moment(selectStates.getSelect('end').value).format('YYYY-MM-DD HH:mm:ss'),
                Ids:Ids
            }
            let params1={
                GroupId:currentGroupId,
                UseType:1,
                TimeRanges:{StartTime:moment(selectStates.getSelect('start').value).format('YYYY-MM-DD HH:mm:ss'),
                EndTime:moment(selectStates.getSelect('end').value).format('YYYY-MM-DD HH:mm:ss'),},
            }
            this.deviceEnergyRP = apis.energyimprovement.getEnergyDay(null,params)
            this.energyAirConditionRP = apis.energyimprovement.getEnergyAirCondition(null,params)
            // this.hourEnergyRP = apis.energyimprovement.getEnergyHour(Ids[0],params1)
            this.registerRequest(this.deviceEnergyRP.request);
            this.registerRequest(this.energyAirConditionRP.request);
            // this.registerRequest(this.hourEnergyRP.request);
            let requests = Promise.all([this.deviceEnergyRP.promise,this.energyAirConditionRP.promise,]);
            requests
                .then(res=>{
                    let deviceDetailList = res[0].Data,
                        devicesChangeInfo = res[1].Data;
                        // hourEnergyList = res[2].Data;
/*                    devicesChangeInfo = devicesChangeInfo.map((d,i) => {
                        let id = d.DeviceId
                        d.total = 0
                        deviceDetailList.map(day =>{
                            if(day.DeviceEnergyMaps){
                                d.total += day.DeviceEnergyMaps[i].Power
                            }
                        })
/!*                        d.hourTotal = hourEnergyList[i].HourAvePower
                        d.OnHour = hourEnergyList[i].OnHour*!/
                        return d
                    });*/

                    this.setState({
                        devicesChangeInfo:devicesChangeInfo,
                        isLoadingDevicesChangeInfo:false,
                        deviceDetailList:deviceDetailList,
                        isLoadingDeviceDetailList:false,
                        // hourEnergyList:hourEnergyList,
                        isLoadingHourEnergyList:false
                    })
                })
                .catch(err => {
                    if (!err.abort) {
                        alert(err.message);
                        this.setState({
                            isLoadingDevicesChangeInfo:false,
                            isLoadingDeviceDetailList:false,
                            isLoadingHourEnergyList:false
                        })

                    }
                })
        }
       
    }

    componentDidMount() {
        let id = store.get('communityId')
        this.getGroupData(id)
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
        },()=>this.getDevicesList());
        this.groupRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                let list = data.map((c)=> {
                    let catalog = c.Path.split('/');
                    catalog.pop();
                    catalog.shift();
                    catalog.push(c.Id)
                    catalog = catalog.join('|');
                    return {
                        name: c.Name,
                        value: c.Id,
                        catalog:catalog
                    }
                });
                const dataTree = new Tree(list);
                const treeData = dataTree.init({name:'全部区域',value:id});
                this.setState({
                    isLoadingGroup:false,
                    treeData:treeData
                },this.handleTreeList);
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.message);
                    this.setState({
                        isLoadingGroup:false
                    })

                }
            })
    }

    getCompareContent(a,b){
        let result = [];
        if(a.length>0&&b.length>0){
            a.map(ad=>{
                b.map(bd=>{
                    result.push([ad,bd])
                })
            })
        }
        return result
    }


    render() {
        const {isLoadingDevicesChangeInfo,devicesChangeInfo,isLoadingDeviceList,deviceList,hourEnergyList,isLoadingHourEnergyList,currentGroupId
            ,deviceDetailList,isLoadingDeviceDetailList, uploader,isShowInfoModal,typeList,selectStates,isLoadingGroup,treeData,checkedIds,
        isShowQRModal,selectArea} = this.state;
       
        let before = [],after = []
        devicesChangeInfo&&devicesChangeInfo.map(i => {
            if(i.IsReformed){
                after.push(i)
            }else {
                before.push(i)
            }
        })
        let compareData = this.getCompareContent(after,before)
        
        return (
                <div className="sem-has-middle-bar ab" onClick={()=>this.listSetSelectState(null,{open:false})}>
                    <SideCondition >
                        <SideConditionChild className="list" text="选择区域" height="40%">
                            <div className="search-title">查询条件</div>
                            <div className="search-child">
                                选择区域：
                                <div style={{width:'61%',overflow:'hidden'}}>
                                    <Link to={{pathname:'/location',query:{from:'compare/ab',currentId:currentGroupId}}}>
                                        <div className="select-area"><span style={{marginLeft:'17px',width:'50%'}}>{selectArea}</span><span className="icon"/></div>
                                    </Link>
                                </div>
                            </div>
                        </SideConditionChild>
                        <SideConditionChild className="list" text="选择对比设备">
                            <div>
                                <DeviceListBar data={deviceList} isLoading={isLoadingDeviceList} onChange={(list)=>this.setState({deviceList:list})}/>
                            </div>
                        </SideConditionChild>
                    </SideCondition>
                    <div className="sem-main-content">
                        <div className="wrapper">
                            <div className="sem-main-tool">
                                <ChooseBar data={deviceList} isLoading={isLoadingDeviceList} onChange={(list)=>this.setState({deviceList:list})}
                                >
                                    <span  className="tool-title">对比时间：</span>
                                    <DateSelect {...selectStates.getSelect('start')}
                                                placeholder="开始时间"
                                                style={{width:'115px'}}
                                                endWith="day"
                                                onChange={(obj)=>{this.listSetSelectState('start',obj);}}/>
                                    <span className="tool-sprit">-</span>
                                    <DateSelect {...selectStates.getSelect('end')}
                                                placeholder="结束时间"
                                                style={{width:'115px'}}
                                                endWith="day"
                                                onChange={(obj)=>{
                                                    if(obj.value){
                                                        obj.value = moment(new Date(obj.value)).add(1,'day').add(-1,'second').toDate()
                                                    }
                                                    this.listSetSelectState('end',obj);
                                                }}/>
                                </ChooseBar>
                                <Button className="tool-button" style={{width:'60%',position:'relative',left:'50%',marginLeft:'-111.9px',marginBottom:'11px'}} onClick={()=>this.search()}>开始对比</Button>
                            </div>
                            <div className="sem-main-top">
                                <div className="ab-title">设备日均用电量对比</div>
                                <div className="ab-unit">kWh</div>
                                <PreLoader show={isLoadingDeviceDetailList} text="正在获取用电信息"/>
                                {
                                    !isLoadingDeviceDetailList&& (
                                        deviceDetailList.length ?
                                            <CompareChart data={deviceDetailList} title="设备日均用电量对比"/>
                                            : <div style={{
                                                backgroundImage: `url(${icons.noDevice})`,
                                                width: 190,
                                                height: 156,
                                                position: 'relative',
                                                top: '50%',
                                                left: '50%',
                                                marginLeft: -95,
                                                marginTop: -78,
                                                backgroundSize:'cover'
                                            }}/>
                                    )
                                }


                            </div>
                            <div className="sem-main-middle">
                                {
                                    isLoadingDevicesChangeInfo?<PreLoader />:
                                            <PanelTable text="用电对比" align="center">
                                                <div style={{maxHeight: '745px',overflow:'scroll'}}>

                                                    <Table>
                                                        <thead >
                                                        <tr>

                                                            <Table.Th className="large">设备参数/设备名称</Table.Th>
                                                            {
                                                                devicesChangeInfo&&devicesChangeInfo.map((m,n)=>{
                                                                    return(
                                                                        <Table.Th className="min" key={n}>{m.DeviceNick}</Table.Th>
                                                                    )
                                                                })
                                                            }
                                                        </tr>
                                                        </thead>
                                                        <Table.Body>
                                                            <tr>
                                                                <td>空调品牌型号</td>
                                                                {
                                                                    devicesChangeInfo&&devicesChangeInfo.map((d,n)=>(
                                                                        <td key={n}>{d.BrandModel}</td>))
                                                                }
                                                            </tr>
                                                            <tr>
                                                                <td>制冷量</td>
                                                                {
                                                                    devicesChangeInfo&&devicesChangeInfo.map((d,n)=>(
                                                                        <td key={n}>{d.CoolCapacity}</td>))
                                                                }
                                                            </tr>
                                                            <tr>
                                                                <td>制冷剂</td>
                                                                {
                                                                    devicesChangeInfo&&devicesChangeInfo.map((d,n)=>(
                                                                        <td key={n}>{d.IsReformed?d.NewRefrigerant:d.OldRefrigerant}</td>))
                                                                }
                                                            </tr>
                                                            <tr>
                                                                <td>平均气温(℃)</td>
                                                                {
                                                                    devicesChangeInfo&&devicesChangeInfo.map((d,n)=>(
                                                                        <td key={n}>{d.AveTemperature}</td>))
                                                                }
                                                            </tr>
                                                            <tr>
                                                                <td>总用电量(kWh)</td>
                                                                {
                                                                    devicesChangeInfo&&devicesChangeInfo.map((d,n)=>(
                                                                        <td key={n}>{d.Power.toFixed(2)+' kWh'}</td>))
                                                                }
                                                            </tr>
                                                            <tr>
                                                                <td>开机时长(h)</td>
                                                                {
                                                                    devicesChangeInfo&&devicesChangeInfo.map((d,n)=>(
                                                                        <td key={n}>{d.OnTime}</td>))
                                                                }
                                                            </tr>
                                                            <tr>
                                                                <td>压缩机工作时长(h)</td>
                                                                {
                                                                    devicesChangeInfo&&devicesChangeInfo.map((d,n)=>(
                                                                        <td key={n}>{d.CompressorOnTime}</td>))
                                                                }
                                                            </tr>
                                                            <tr>
                                                                <td>平均用电量(kWh)</td>
                                                                {
                                                                    devicesChangeInfo&&devicesChangeInfo.map((d,n)=>(
                                                                        <td key={n}>{d.AvePower.toFixed(2)}</td>))
                                                                }
                                                            </tr>
                                                        </Table.Body>
                                                    </Table>
                                                </div>
                                            </PanelTable>
                                }
                            </div>
                            <div className="sem-main-bottom">
                                {/*<div className="left">
                                    <div className="ab-title">设备每小时用电量对比</div>
                                    <div className="ab-unit">kWh</div>
                                        <PreLoader show={isLoadingHourEnergyList} text="正在获取用电信息"/>
                                        {!isLoadingHourEnergyList&&(
                                            hourEnergyList.length ?<HourCharts data={hourEnergyList}/>:
                                            <div style={{
                                                backgroundImage: `url(${icons.noDevice})`,
                                                width: 190,
                                                height: 156,
                                                position: 'relative',
                                                top: '50%',
                                                left: '50%',
                                                marginLeft: -95,
                                                marginTop: -78
                                            }}/>
                                        )}

                                </div>*/}
                                <div className="right ">
                                    <div className="ab-title">对比结果</div>
                                    <div className="ab-content">
                                        {
                                            !isLoadingDevicesChangeInfo&&(compareData.length>0?compareData.map(d=>(
                                                <div className="item"><div className="item-icon"></div>
                                                    <span className="item-word">改造设备{<span className="red" style={{marginLeft:0}}>{d[0].DeviceNick}</span>}比未改造设备{<span className="red" style={{marginLeft:0}}>{d[1].DeviceNick}</span>}平均
                                                        每小时{(d[1].AvePower-d[0].AvePower) > 0? '少':'多'}用电{Math.abs((d[1].AvePower - d[0].AvePower)).toFixed(2)+'kWh'}。
                                                        &nbsp;&nbsp;&nbsp;占比为:<span className="red">{d[0].AvePower?Math.abs(((d[1].AvePower - d[0].AvePower)/d[1].AvePower * 100)).toFixed(2)+'%':'未知'}</span>
                                                    </span></div>
                                            )):
                                                    <div style={{
                                                        backgroundImage: `url(${icons.noDevice})`,
                                                        width: 190,
                                                        height: 156,
                                                        position: 'relative',
                                                        top: '50%',
                                                        left: '50%',
                                                        marginLeft: -95,
                                                        marginTop: -78
                                                    }}/>

                                            )
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






module.exports = AB;
