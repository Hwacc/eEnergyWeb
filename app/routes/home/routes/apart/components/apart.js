/**
 * 创建于：2016-6-8
 * 创建人：杨骐彰
 * 说明： 设备管理主页面
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import PanelTable from 'redux-components/paneltable'
import Table from 'redux-components/table'
import Button from 'redux-components/button'
import {Input} from 'redux-components/formcontrol'
import {TreeList,Tree} from 'redux-components/treeList'
import Statistics from 'redux-components/statistics'
import apis from 'apis'
import store from 'store'
import {getParentNode} from 'utils'
import PreLoader from 'redux-components/preloader'
import moment from 'moment'
import * as staticType from 'utils/staticType'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
import {SideCondition,SideConditionChild} from 'redux-components/side-condition'
import './style.scss'
import TotalCharts from './total-charts'
import GroupLoss from './loss-statistics-charts'
import AllTypeCharts from './all-type-charts'
import Promise from 'q'
import {DateSelect,DateSelectState} from 'redux-components/dropdownselect/datepicker'
class Apart extends BaseComponent {
    constructor(){
        super(...arguments);
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        let isLastDayByMonth = this.isLastDayByMonth(now)
        let selectStates = new SelectState([
            ['community',{}],['searchTimeType', {
                label:'', placeholder:'不限',allowEmpty:false,value:2,
                options:[{value:3,name:'按小时显示'},{value:2,name:'按日显示'},
                    {value:1,name:'按月份显示'},{value:0,name:'按年度显示'}]}]
        ]);
        let dateStates = new DateSelectState([
            ['start',{value:moment(new Date(year,month,day)).add(-10,'day').toDate(),isMini:true,endWith:'day'}],
            ['end',{value:moment(new Date(year,month,day)).add(1,'day').add(-1,'second').toDate(),isMini:true,endWith:'day'}]
        ]);
        dateStates.subMap(selectStates.getSelects());
        this.state={

            //分组名称
            groupName:'',
            //管理区域
            community:null,
            //是否正在查询
            isLoadingDeviceList:false,
            //设备列表
            deviceList: [],
            //显示远程控制
            isShowControlModal:false,
            //显示批量控制
            isShowBatchModal:false,
            //当前选中分组
            activeGroupInfo:null,
            //设备号
            sns:'',
            //分组号
            group:null,
            //是否被全选
            allSelect:false,
            //当前点击的设备
            currentSns:[],
            //选中的设备
            snsChecked:[],
            isLoadedGroup: false,
            isFirst: true,
            //selects
            selectStates:dateStates,
            //treeData
            treeData:null,
            isLoadingGroup:false,
            currentGroupId:-1,
            //时间参数
            searchType:staticType.timeBaseOnEnum.month,
            tableHead:[],
            deviceTypes:[],
            //环比时间
            compareDaySearchTimeParams:[new Date(year, month, day),
                moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()],
            compareToDaySearchTimeParams:[moment(new Date(year, month, day)).add(-1,'day').toDate(),
                moment(new Date(year, month, day)).add(-1, 'second').toDate()],
            compareMonthSearchTimeParams:[new Date(year, month, 1),
                moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()],
            compareToMonthSearchTimeParams:[new Date(year, month-1, 1),
                isLastDayByMonth?moment(new Date(year, month, 0)).add(1,'day').add(-1, 'second').toDate()
            : moment(moment(new Date(year,month-1,day)).add(1,'day').add(-1,'second'))],
            isLoadingCompare:false,
            treeDataClickValue: -1

        }
    }
    //判断是否是一个月的最后一天
    isLastDayByMonth(time){
        let temp = new Date(time)
        let totalDayByMonth = new Date(temp.getFullYear(),temp.getMonth()+1,0).getDate()
        if(time.getDate() === totalDayByMonth){
            return true
        }
        return false

    }
    apartSetSelectState(type,obj,cb) {
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
        let {selectStates} = this.state;
        let list  = this.props.list
        if(list.length>0){
            let communityId = store.get('communityId');
            let val = communityId||(list[0]?list[0].value:null);
            val = !selectStates.getSelect('community').multiple? val:[{value:val}];
            /*this.getGroupData(val);*/
            this.apartSetSelectState('community',{
                options: list,
                isLoading: false,
                value:val,
            });
        }
       /*
        this.communityRP&&this.communityRP.request.abort();
        this.communityRP = apis.group.getGroupListByCommunityID();
        this.registerRequest(this.communityRP.request);
        this.apartSetSelectState('community',{
            isLoading:true,
            isFailed:false
        })

        */

        this.setState({
            isLoadingGroup:true,
            treeData:[],
        })

        this.useListRP&&this.useListRP.request.abort();
        this.useListRP = apis.energyInfo.getUseList();
        this.registerRequest(this.useListRP.request);
        this.useListRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                //查询条件
              /*  let data = res[0].Data || [];
                let list = getParentNode(data);
                let communityId = store.get('communityId');
                let val = communityId||(list[0]?list[0].value:null);
                val = !selectStates.getSelect('community').multiple? val:[{value:val}];
                this.apartSetSelectState('community',{
                    options: list,
                    isLoading: false,
                    value:val,
                });*/
                //类型
                let typeData = res.Data || [];
                let head = [];
                let typeList = typeData.map(c => {
                    head.push(c.m_Item1);
                    return {
                        name: c.m_Item2,
                        value: c.m_Item1,
                        catalog:(c.m_Item1).toString()
                    }
                });
                let deviceTypes = {};
                typeData.map(i=>{
                    deviceTypes[i.m_Item1] = i.m_Item2
                });
                const dataTree = new Tree(typeList);
                const treeData = dataTree.init({name:'全部类型',value:-1});
                this.setState({
                    isLoadingGroup:false,
                    treeData:treeData,
                    deviceTypes:deviceTypes,
                    tableHead:head
                },()=>this.search())
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.apartSetSelectState('community',{
                       
                        isFailed:true,
                        isLoadingGroup:false

                    });
                }
            })
    }
    /*获取环比*/
    getCompareData(c,type){
        this.setState({
            isLoadingCompare:true,
            energyTendencyData:[]});
        const {compareDaySearchTimeParams,compareToDaySearchTimeParams,
            compareToMonthSearchTimeParams,compareMonthSearchTimeParams} = this.state;
        this.energyInfoRP && this.energyInfoRP.request.abort();

        this.energyInfoRP = apis.energyInfo.getUseMultiTotal(type<0?
            {
                GroupId:c,
                TimeRanges:[{StartTime:moment(compareDaySearchTimeParams[0]).format(),EndTime:moment(compareDaySearchTimeParams[1]).format()},
                    {StartTime:moment(compareMonthSearchTimeParams[0]).format(),EndTime:moment(compareMonthSearchTimeParams[1]).format()},
                    {StartTime:moment(compareToDaySearchTimeParams[0]).format(),EndTime:moment(compareToDaySearchTimeParams[1]).format()},
                    {StartTime:moment(compareToMonthSearchTimeParams[0]).format(),EndTime:moment(compareToMonthSearchTimeParams[1]).format()}]
            }: {
                GroupId:c,
                UseType:type,
                TimeRanges:[{StartTime:moment(compareDaySearchTimeParams[0]).format(),EndTime:moment(compareDaySearchTimeParams[1]).format()},
                    {StartTime:moment(compareMonthSearchTimeParams[0]).format(),EndTime:moment(compareMonthSearchTimeParams[1]).format()},
                    {StartTime:moment(compareToDaySearchTimeParams[0]).format(),EndTime:moment(compareToDaySearchTimeParams[1]).format()},
                    {StartTime:moment(compareToMonthSearchTimeParams[0]).format(),EndTime:moment(compareToMonthSearchTimeParams[1]).format()}]
            }
        );

        this.registerRequest(this.energyInfoRP.request);
        this.energyInfoRP.promise.then((res)=>{
            if(!this.mounted)return;
            let data = res.Data;
            let dayChangeNum = Math.abs((data[0]-data[2])/(data[2]==0?1:data[2])*100).toFixed(2)+'%';
            let dayIsAdd = (data[0]-data[2])>0;
            let monthChangeNum = Math.abs((data[1]-data[3])/(data[3]==0?1:data[3])*100).toFixed(2)+'%';
            let monthIsAdd = (data[1]-data[3])>0;
            let compareData = [[{num:data[0],name:'本日用电量',changeNum:dayChangeNum,isAdd:dayIsAdd,},
                {num:data[1],name:'本月用电量',changeNum:monthChangeNum,isAdd:monthIsAdd}],
                [{num:data[2],name:'昨日同期'},{num:data[3],name:'上月同期'}]
            ]
            this.setState({
                compareData:compareData,
                isLoadingCompare:false,
            })
        }).catch((err)=>{
            if (!err.abort) {
                this.setState({
                    isLoadingCompare: false,
                })
                alert(err.msg)
            }
        })
    }
    handleTreeList(item){
        let data = this.state.treeData
        data = Tree.setShow(item,data)
        this.setState({treeData:data})

    }
    /**
     *
     * 查询
     */
    search(typeId){
        const {currentGroupId,selectStates,deviceTypes,searchType} = this.state;
        let types = Object.assign({},deviceTypes);
        let community = selectStates.getSelect('community').value
        let deviceType = currentGroupId>0 ? currentGroupId : null
        this.deviceRP&&this.deviceRP.request.abort()
        this.getCompareData(community,currentGroupId)
        this.setState({
            isLoadingDeviceList:true,
        })
        this.deviceRP = apis.energyInfo.getUseDetail({
            Form: searchType,
            GroupId:community,
            StartTime:moment(selectStates.getSelect('start').value).format('YYYY-MM-DD HH:mm:ss'),
            EndTime:moment(selectStates.getSelect('end').value).format('YYYY-MM-DD HH:mm:ss'),
            UseType:typeId||deviceType
        })
        this.registerRequest(this.deviceRP.request);
        this.deviceRP.promise
            .then((res)=>{
                if(!this.mounted)return
                let data = res.Data||[]
                let start = moment(selectStates.getSelect('start').value).format('YYYY-MM-DD HH:mm:ss');
                let end = moment(selectStates.getSelect('end').value).add(1,'second').format('YYYY-MM-DD HH:mm:ss');
                let list = [];
                if(selectStates.getSelect('start').value<=selectStates.getSelect('end').value){
                    while (start!=end){
                        let obj = {
                            StatisticTime:start,
                            formTime: start,
                            Total:0.00,
                        };

                        for(var key in types){
                            types[key] = 0.00;
                        }
                        obj = Object.assign({},obj,types)
                        data.some((i,index)=>{
                            if(i.StatisticTime==start){
                                obj = Object.assign({},obj,i);
                                i.Detail.map(item=>{
                                    obj[item.UseType] = item.Power
                                })
                            }
                            return i.StatisticTime==start
                        });
                        if(searchType == staticType.timeBaseOnEnum.multiYear){
                            obj.formTime = moment(obj.StatisticTime).format('YYYY年')
                            list.push(obj);
                            start = moment(start).add(1,'year').format('YYYY-MM-DD HH:mm:ss');
                        }else if(searchType == staticType.timeBaseOnEnum.year){
                            obj.formTime = moment(obj.StatisticTime).format('YYYY年M月')
                            list.push(obj);
                            start = moment(start).add(1,'month').format('YYYY-MM-DD HH:mm:ss');
                        }else if(searchType == staticType.timeBaseOnEnum.month){
                            obj.formTime = moment(obj.StatisticTime).format('YYYY年M月D日')
                            list.push(obj);
                            start = moment(start).add(1,'day').format('YYYY-MM-DD HH:mm:ss');
                        }else{
                            obj.formTime = moment(obj.StatisticTime).format('YYYY年M月D日 H时')
                            list.push(obj);
                            start = moment(start).add(1,'hour').format('YYYY-MM-DD HH:mm:ss');
                        }
                    }
                }else{
                    alert('请选择正确的开始结束时间！')
                }
                this.setState({
                    deviceList: list,
                    isLoadingDeviceList: false
                });
            })
            .catch((err)=>{
                if(!err.abort){
                    alert(err.msg);
                    this.setState({
                        isLoadingDeviceList:false,
                        deviceList:null
                    })
                }
            })
    }
    /**
     * 改变被选中状态
     * @param device
     */
    toggleCheckState(device) {
        const {deviceList} = this.state;
        device.Checked = !device.Checked;

        let allSelect = deviceList.every((i)=>i.Checked);
        var sns=[];
        for(var i = 0,length = deviceList.length;i<length;i++){
            if(deviceList[i].Checked){
                sns.push(deviceList[i].SN)
            }
        }
        this.setState({
            deviceList: deviceList,
            allSelect: allSelect,
            snsChecked:sns
        });
    }
    /**
     * 全选或反选
     */
    toggleAllSelect() {
        let {allSelect,deviceList} = this.state;
        allSelect = !allSelect;
        //改变全部选择状态
        deviceList.forEach((i)=>i.Checked = allSelect);
        this.setState({
            deviceList: deviceList,
            allSelect: allSelect,
            snsChecked:deviceList.map((item)=>{
                return item.SN
            })
        });
    }
    /*
     关闭弹窗
     */
    hideEditModal() {
        this.deviceDetailRP && this.deviceDetailRP.request.abort();
        this.setState({
            isShowControlModal: false,
            isShowBatchModal: false
        });
    }

    handleAutoSearch(){
        const {isLoadedGroup,isFirst} = this.state;
        if(isFirst && isLoadedGroup){
            this.setState({isFirst: false});
            this.search();
        }

    }

    /**
     * 查询类型条件变化
     * @param type
     */
    handleSearchTypeChange(obj) {
        let type = obj.value;
        let {selectStates} = this.state;
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        //按年查询
        if (type=== 0) {
            this.setState({
                searchType: staticType.timeBaseOnEnum.multiYear
            });
            this.apartSetSelectState(['start','end'],
                [
                    {value:moment(new Date(year, 0, 1)).add(-2, 'year').toDate()},
                    {value:moment(new Date(year, 0, 1)).add(1, 'year').add(-1, 'second').toDate()}
                ]);
        }
        else if (type === 1) {
            this.setState({
                searchType: staticType.timeBaseOnEnum.year
            });
            this.apartSetSelectState(['start','end'],
                [
                    {value:moment(new Date(year, month, 1)).add(-11, 'month').toDate()},
                    {value:moment(new Date(year, month, 1)).add(1, 'month').add(-1, 'second').toDate()}
                ]);
        }
        //按月查询
        else if (type === 2) {
            this.setState({
                searchType: staticType.timeBaseOnEnum.month
            });
            this.apartSetSelectState(['start','end'],
                [
                    {value:moment(new Date(year, month, day)).add(-9, 'day').toDate()},
                    {value:moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()}
                ]);
}
        else {
            this.setState({
                searchType: staticType.timeBaseOnEnum.day
            });
            this.apartSetSelectState(['start','end'],
                [
                    {value:new Date(year, month, day)},
                    {value: moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()}
                ]);
        }
    }

    chartsClick(e){
        let {deviceTypes}= this.state;
        for(let key in deviceTypes){
            if(deviceTypes[key] === e){
                this.setState({currentGroupId: key,treeDataClickValue:key})
            }
        }
        this.search();
    }
    componentDidMount(){
        this.getCommunityData()
    }
    render(){
        let {isLoadingDeviceList,deviceList,isShowControlModal,treeData,isLoadingGroup,
            isShowBatchModal,selectStates,currentGroupId,allSelect,currentSns,snsChecked,
            tableHead,deviceTypes,compareData,isLoadingCompare,searchType,treeDataClickValue} = this.state;
        let total = 0 ;
        if(currentGroupId<0){
            deviceList&&deviceList.map(i=>{
                total = total + i.Total
            })
        }else {
            deviceList && deviceList.map(i=> {
                total = total + i[currentGroupId]
            })
        }
        let communityValue = selectStates.getSelect('community').value;
        let communityOptions = selectStates.getSelect('community').options;
        let communityName = '全部类型';
        communityOptions.length&&communityOptions.map(t=>{
                if(communityValue ==t.value){
                    communityName = t.name
                }
            })

        return (
            <div className="sem-has-middle-bar" onClick={()=>this.apartSetSelectState(null,{open:false})}>
                <SideCondition callback={()=>this.search()}>
                    <SideConditionChild  className="search" text="查询条件"  height="40%">
                        <Table align="left" noborder={true}>
                            <Table.Body className="side-search">
                                <tr>
                                    <td>
                                        查询对象：
                                        <MySelect onChange={(obj)=>this.apartSetSelectState('community',obj)}
                                            {...selectStates.getSelect('community')} getData={()=>this.getCommunityData()}
                                                  style={{maxWidth:'130px'}}>
                                            {selectStates.getSelect('community').open&&
                                            <SelectList {...selectStates.getSelect('community')}
                                                onChange={(obj,cb)=>{this.apartSetSelectState('community',obj,this.search());}}
                                            />}
                                        </MySelect>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        显示类型：
                                        <MySelect onChange={(obj)=>{this.apartSetSelectState('searchTimeType',obj);}}
                                            {...selectStates.getSelect('searchTimeType')} style={{maxWidth:'130px'}}>
                                            {selectStates.getSelect('searchTimeType').open&&
                                            <SelectList {...selectStates.getSelect('searchTimeType')}
                                                onChange={(obj,cb)=>{this.apartSetSelectState('searchTimeType',obj,cb);this.handleSearchTypeChange(obj)}}
                                            />}
                                        </MySelect>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        {
                                            searchType === staticType.timeBaseOnEnum.multiYear &&
                                            <div><p>选择起始年份:</p>
                                                <DateSelect {...selectStates.getSelect('start')}
                                                            className="distanceX"
                                                            placeholder="开始年份"
                                                            endWith="year"
                                                            onChange={(obj)=>{this.apartSetSelectState('start',obj);}}/>
                                                <p>选择结束年份:</p>
                                                <DateSelect {...selectStates.getSelect('end')}
                                                            className="distanceX"
                                                            placeholder="结束年份"
                                                            endWith="year"
                                                            onChange={(obj)=>{
                                                                if(obj.value){
                                                                    obj.value = moment(obj.value).add(1,'year').add(-1,'second').toDate()
                                                                }
                                                                this.apartSetSelectState('end',obj);}
                                                            }/>

                                            </div>

                                        }
                                        {
                                            searchType === staticType.timeBaseOnEnum.year &&
                                            <div>
                                                <p>选择起始月份：</p>
                                                <DateSelect {...selectStates.getSelect('start')}
                                                            className="distanceX"
                                                            placeholder="选择起始月份"
                                                            endWith="month"
                                                            onChange={(obj)=>{this.apartSetSelectState('start',obj);}}/>
                                                <p>选择结束月份：</p>
                                                <DateSelect {...selectStates.getSelect('end')}
                                                            className="distanceX"
                                                            placeholder="选择结束月份"
                                                            endWith="month"
                                                            onChange={(obj)=>{
                                                                if(obj.value){
                                                                    obj.value = moment(obj.value).add(1,'month').add(-1,'second').toDate()
                                                                }
                                                                this.apartSetSelectState('end',obj);}}/>
                                            </div>
                                        }
                                        {
                                            searchType === staticType.timeBaseOnEnum.month &&
                                            <div>
                                                <p>选择起始日期：</p>
                                                <DateSelect {...selectStates.getSelect('start')}
                                                            className="distanceX"
                                                            placeholder="选择起始日期"
                                                            endWith="day"
                                                            onChange={(obj)=>{this.apartSetSelectState('start',obj);}}/>
                                                <p>选择结束日期：</p>
                                                <DateSelect {...selectStates.getSelect('end')}
                                                            className="distanceX"
                                                            placeholder="选择起始日期"
                                                            endWith="day"
                                                            onChange={(obj)=>{
                                                                if(obj.value){
                                                                    obj.value = moment(obj.value).add(1,'day').add(-1,'second').toDate()
                                                                }
                                                                this.apartSetSelectState('end',obj);}}/>
                                            </div>
                                        }
                                        {
                                            searchType === staticType.timeBaseOnEnum.day &&
                                            <div><p>选择日期：</p>
                                                <DateSelect {...selectStates.getSelect('start')}
                                                            className="distanceX"
                                                            placeholder="选择日期"
                                                            endWith="day"
                                                            onChange={(obj)=>{
                                                                let endObj = Object.assign({},obj);
                                                                if(obj.value){
                                                                    endObj.value = moment(obj.value).add(1,'day').add(-1,'second').toDate()
                                                                }
                                                                this.apartSetSelectState(['start','end'],[obj,endObj]);}}/>
                                            </div>
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{textAlign:'center',marginTop: 16}}>
                                        <Button className="condition-button"  onClick={this.search.bind(this)}>查询</Button>
                                    </td>
                                </tr>
                            </Table.Body>

                        </Table>
                    </SideConditionChild>
                    <SideConditionChild className="list" text="选择类型">

                        <div className="group-condition-wrapper">
                            {isLoadingGroup?<PreLoader/>
                                : (treeData?<TreeList data={treeData} onClick={(item)=>this.handleTreeList(item)}
                                            handleCheck={(val)=>{this.setState({currentGroupId:val,treeDataClickValue:val},()=>this.search(val));}}
                                             value={currentGroupId}/>:<div></div>)}
                        </div>
                    </SideConditionChild>
                </SideCondition>
                <div className="sem-main-content" >

                    {
                        treeDataClickValue<0&&
                        <div className="charts-wrapper">
                            <div className="all-type-charts">
                                <span className="charts-total">总用电量   :   {total.toFixed(2)}</span>
                                { isLoadingDeviceList?<PreLoader />
                                    :<AllTypeCharts data={deviceList} 
                                                    useTypes={deviceTypes} 
                                                    name={communityName}
                                                    searchType={searchType}
                                                    chartsClick={(e)=>this.chartsClick(e)}/>}
                            </div>
                        </div>
                    }
                    {
                        treeDataClickValue>=0&&
                        <div className="charts-wrapper">
                            <div className="left line">
                                <span className="charts-total">总用电量   :   {total.toFixed(2)}</span>
                                {!isLoadingDeviceList&&<TotalCharts data={deviceList} type={currentGroupId} types={deviceTypes} searchType={searchType}/>}
                            </div>
                            <div className="right">
                                <div className="pie">
                                    {
                                        !isLoadingDeviceList&&<GroupLoss data={deviceList} useTypes={deviceTypes}/>
                                    }
                                </div>
                                <div className="word">
                                    {!isLoadingCompare&&<Statistics title="用能环比-总" data={compareData}
                                                                    foots="kWh"/>}
                                </div>
                            </div>
                        </div>
                    }
                    
                    <div className="table-wrapper">
                        <PanelTable text="分项用能明细"
                                    align="center"
                                    isLoading={isLoadingDeviceList}
                                    loadingText="正在获取数据"
                        >
                            {
                                !isLoadingDeviceList&&<div>
                                    <div  className="table-need-head">
                                        <Table>
                                            <thead>
                                            <tr>
                                                <th>日期</th>
                                                <th >
                                                    总用电量
                                                </th>
                                                {
                                                    tableHead.map((i,key)=>{
                                                        return<th key={key}>{deviceTypes[i]}</th>
                                                    })
                                                }
                                            </tr>
                                            </thead>
                                            <Table.Body>
                                                {
                                                    !isLoadingDeviceList && deviceList.map((t, i)=> {
                                                        return (
                                                            <tr key={i}>
                                                                <td>{t.formTime}</td>
                                                                <td>{t.Total.toFixed(2)}</td>
                                                                {
                                                                    tableHead.map((i,key)=>{
                                                                        return<td key={key}>{t[i].toFixed(2)}</td>
                                                                    })
                                                                }
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </Table.Body>
                                        </Table>
                                    </div>
                                    <div style={{height:'250px'}} className="table-need-body">
                                        <Table>
                                            <thead >
                                            <tr>
                                                <th>日期</th>
                                                <th >
                                                    总用电量
                                                </th>
                                                {
                                                    tableHead.map((i,key)=>{
                                                        return<th key={key}>{deviceTypes[i]}</th>
                                                    })
                                                }
                                            </tr>
                                            </thead>
                                            <Table.Body>
                                                {
                                                    !isLoadingDeviceList && deviceList.map((t, i)=> {
                                                        return (
                                                            <tr key={i}>
                                                                <td>{t.formTime}</td>
                                                                <td>{t.Total.toFixed(2)}</td>
                                                                {
                                                                    tableHead.map((i,key)=>{
                                                                        return<td key={key}>{t[i].toFixed(2)}</td>
                                                                    })
                                                                }
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </Table.Body>
                                        </Table>
                                    </div>
                                </div>
                            }
                                {(!deviceList || !deviceList.length) && <h5 className="text-center">未查询或没有查询到结果</h5>}

                        </PanelTable>
                        <br/>

                    </div>
                    {
                        isShowControlModal&&<ControlModal hideEditModal={this.hideEditModal.bind(this)} currentSns={currentSns}/>
                    }
                    {
                        isShowBatchModal&&<LotSizeControl hideEditModal={this.hideEditModal.bind(this)} sns={snsChecked}/>
                    }
                </div>
            </div>
        )
    }
}

module.exports = Apart;
