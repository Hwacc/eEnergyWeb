/**
 * 创建于：2016-6-8
 * 创建人：杨骐彰
 * 说明： 设备管理主页面
 */


import {Input} from 'redux-components/formcontrol'
import {TreeList,Tree} from 'redux-components/treeList'
import apis from 'apis'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
import {SideCondition,SideConditionChild} from 'redux-components/side-condition'
import '../style.scss'
import PreLoader from 'preloader'
import * as staticType from 'utils/staticType'
import moment from 'moment'
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import PanelTable from 'redux-components/paneltable'
import Table from 'redux-components/table'
import Button from 'redux-components/button'
import store from 'store'
import TotalCharts from './total-charts'
import AreaCharts from './area-charts'
import AllAreaCharts from './all-area-charts'
import Statistics from 'redux-components/statistics'
import {getParentNode} from 'utils'
import icons from 'icons'
import {DateSelect,DateSelectState} from 'redux-components/dropdownselect/datepicker'

export default class Map extends BaseComponent {
    constructor(){
        super(...arguments);
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        let selectStates = new SelectState([
            ['searchTimeType',{label:'',placeholder:'不限',allowEmpty:false,value:2, options:[{value:3,name:'按小时显示'},{value:2,name:'按日显示'},{value:1,name:'按月份显示'},{value:0,name:'按年度显示'}]}],
            ['group',{label:'分组',placeholder:'不限',allowEmpty:true},{type:'devicesType',label:'设备类型', options:[{value:1,name:'插座'},{value:2,name:'电表'}],allowEmpty:true,placeholder:'全部'}],
        ]);
        let dateStates = new DateSelectState([
            ['start',{value:moment(new Date(year,month,day)).add(-10,'day').toDate(),isMini:true,endWith:'day'}],
            ['end',{value:moment(new Date(year,month,day)).add(-1,'second').toDate(),isMini:true,endWith:'day'}]
        ]);
        dateStates.subMap(selectStates.getSelects());
        let value = store.get('tree')
        this.state={
            searchType:staticType.timeBaseOnEnum.month,
            //分组名称
            groupName:'',
            //当前选中分组
            activeGroupInfo:null,
            //是否被全选
            isLoadedGroup: false,
            isFirst: true,
            //selects
            selectStates:dateStates,
            //treeData
            treeData: null,
            isLoadingGroup:false,
            currentGroupId:null,
            historyData: [],
            historyRankData: [],
            titles:[],
            isLoadingHistoryData: false,
            isLoadingChildRank:false,
            isLoadingMultiTotal: false,
            totalData:[],
            //compare
            isLoadingCompare:false,
            compareData:[],
            energyTendencyData:[],

            historyChildData: [],
            list:[],
            areaTypes:{},
            treeDataClickLevel: 0,
            topLevel:0,
            group:value

        }
    }

    areaSetSelectState(type,obj,cb) {
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
    getGroupData(){
        let {group} = this.state;
        let id = group.value;
        if (!id && id == 0)return;
        this.groupRP && this.groupRP.request.abort();
        this.groupRP = apis.group.getGroupListByCommunityID(id);
        this.registerRequest(this.groupRP.request);
     
        this.setState({
            isLoadingGroup:true,
            treeData:[],
            currentGroupId:null,
        });

        let showId = id;
        if(group.level==1&&group.children.length) {
            group.children.map((item, index)=> {
                if (index == 0) {
                    showId = item.value
                }
            })
        }
        
        this.groupRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                let areaTypes={};
                data.map(i=>{
                    areaTypes[i.Id] = i.Name;
                });
                let treeTop={};
                data.map((d,i)=>{
                    if(d.Id == id){
                        treeTop = d;
                        this.setState({topLevel:treeTop.Level})
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
                        groupType:c.GroupType,
                        level:c.Level
                    }
                });
                const dataTree = new Tree(list)
                const treeData = dataTree.init({name:treeTop.Name,value:treeTop.Id,level:treeTop.Level});
           
                this.setState({
                    isLoadingGroup:false,
                    treeData:treeData,
                    areaTypes: areaTypes,
                    currentGroupId:showId

                },()=>this.search())
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
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

    //查询
    search(id) {
        let gid = id||this.state.currentGroupId;
        let {treeData} = this.state;
        treeData&&treeData.map((t)=>{
          if(t.value == gid){
              this.setState({treeDataClickLevel: t.level});
          }
        });
        if(gid){
            this.getGroupDetail(gid);
            this.getChildRank(gid);
            this.getMultiTotal(gid);
            this.getCompareData(gid);
        }else{
            alert('请选择区域！')
        }
    }
    getGroupDetail(c){
        let {selectStates,treeData,searchType} = this.state;
        let postDataDetail = {
            GroupId: c,
            Form: searchType,
            StartTime:moment(selectStates.getSelect('start').value).format(),
            EndTime:moment(selectStates.getSelect('end').value).format()

        };
        let group = {};
        treeData&&treeData.some(i=>{
            if(i.value==c){
                group=i
            }

            return i.value==c;
        });
        let childGroups = [];
        treeData&&treeData.map(i=>{
            if(i.level==group.level+1){
                if(i.catalogArray[i.level-1]==group.value){
                    childGroups.push(i)
                }

            }
        });

        this.energyInfoRP && this.energyInfoRP.request.abort();
        this.setState({
            isLoadingHistoryData: true,
            historyData: [],
            childGroups:childGroups
        });
        let baseObj = {};
        childGroups.map(g=>{
            baseObj[g.name] = 0
        });
        this.energyInfoRP = apis.energyInfo.getGroupDetail(postDataDetail);
        this.registerRequest(this.energyInfoRP.request);
        this.energyInfoRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let list = [];
                let start = moment(selectStates.getSelect('start').value).format('YYYY-MM-DD HH:mm:ss');
                let end = moment(selectStates.getSelect('end').value).add(1,'second').format('YYYY-MM-DD HH:mm:ss');
                if(selectStates.getSelect('start').value<=selectStates.getSelect('end').value) {
                    while (start != end) {
                        let baseObj = {
                            StatisticTime: start,
                        };
                        let obj = {
                            TotalEle: 0
                        };
                        childGroups.map(g=> {
                            obj[g.name] = 0
                        });
                        res.Data && res.Data.some(i=> {
                            if (i.StatisticTime == start) {
                                if (i.ChildGroups) {
                                    i.ChildGroups.map(item=> {
                                        obj[item.GroupName] = item.TotalEle
                                    })
                                }
                                obj = Object.assign({}, obj, i)
                            }
                            return i.StatisticTime == start
                        });
                        if(searchType == staticType.timeBaseOnEnum.multiYear){

                            list.push(Object.assign({}, obj, baseObj));
                            start = moment(start).add(1,'year').format('YYYY-MM-DD HH:mm:ss');
                        }else if(searchType == staticType.timeBaseOnEnum.year){

                            list.push(Object.assign({}, obj, baseObj));
                            start = moment(start).add(1,'month').format('YYYY-MM-DD HH:mm:ss');
                        }else if(searchType == staticType.timeBaseOnEnum.month){
                            list.push(Object.assign({}, obj, baseObj));
                            start = moment(start).add(1,'day').format('YYYY-MM-DD HH:mm:ss');
                        }else{
                            list.push(Object.assign({}, obj, baseObj));
                            start = moment(start).add(1,'hour').format('YYYY-MM-DD HH:mm:ss');
                        }
                    }
                }else{
                    alert('请选择正确的开始结束时间！')
                };
                list&&list.map(i=>{
                    if(searchType == staticType.timeBaseOnEnum.multiYear){
                        i.formTime = moment(i.StatisticTime).format('YYYY年');
                    }else if(searchType == staticType.timeBaseOnEnum.year){
                        i.formTime = moment(i.StatisticTime).format('YYYY年M月');
                    }else if(searchType == staticType.timeBaseOnEnum.month){
                        i.formTime = moment(i.StatisticTime).format('YYYY年M月D日');
                    }else{
                        i.formTime = moment(i.StatisticTime).format('YYYY年M月D日 H时');
                    }
                });
                this.setState({
                    isLoadingHistoryData: false,
                    historyData: list
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    this.setState({
                        isLoadingHistoryData: false
                    });
                    alert(err.msg);
                }
            });
    }




    getChildRank(c){
        let {selectStates,treeData} = this.state;
        this.setState({
            isLoadingChildRank: true,
            historyRankData: []

        });
        let postData={
            Form:selectStates.getSelect('searchTimeType').value,
            GroupId:c,
            StartTime:moment(selectStates.getSelect('start').value).format('YYYY-MM-DD HH:mm:ss'),
            EndTime:moment(selectStates.getSelect('end').value).format('YYYY-MM-DD HH:mm:ss')

        };
        this.energyInfoRankRP && this.energyInfoRankRP.request.abort();
        this.energyInfoRankRP = apis.energyInfo.getChildRank(postData);
        this.registerRequest(this.energyInfoRankRP.request);
        this.energyInfoRankRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                this.setState({
                    isLoadingChildRank: false,
                    historyRankData: res.Data || []
                });

            })
            .catch((err)=> {
                if (!err.abort) {
                    this.setState({
                        isLoadingChildRank: false
                    });
                    alert(err.msg);
                }
            });
    }
    getMultiTotal(c){
        let {selectStates} = this.state;
        let postMulData= {
            GroupId: c,
            TimeRanges: [{
                StartTime: moment(selectStates.getSelect('start').value).format(),
                EndTime: moment(selectStates.getSelect('end').value).format()
            }]
        };

        this.energyInfoMultiTotalRP && this.energyInfoMultiTotalRP.request.abort();
        this.energyInfoMultiTotalRP = apis.energyInfo.getMultiTotal(postMulData);
        this.registerRequest(this.energyInfoMultiTotalRP.request);
        this.energyInfoMultiTotalRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let group = res.Data.map((t)=>{
                    return t.GroupName;
                });
                this.getGroupDetail(c,group);
                this.setState({
                    isLoadingMultiTotal: true,
                    totalData: res.Data || []
                });

            })
            .catch((err)=> {
                if (!err.abort) {
                    this.setState({
                        isLoadingMultiTotal: false
                    });
                    alert(err.msg);
                }
            });
    }
    
    //获取比较统计
    getCompareData(c){
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        let  compareDaySearchTimeParams=[new Date(year, month, day),
            moment(now).add(-1, 'hour').toDate()],
            compareToDaySearchTimeParams=[moment(new Date(year, month, day)).add(-1,'day').toDate(),
            moment(now).add(-1, 'day').add(-1, 'hour').toDate()],
            compareToMonthSearchTimeParams=[new Date(year, month-1, 1),
                moment(new Date(year, month-1, day)).add(1,'day').add(-1, 'second').toDate()],
            compareMonthSearchTimeParams=[new Date(year, month, 1),
                moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()];

        //上月查询时间段

        let lastDay = (moment(new Date(year,month,1)).add(1,'month').add(-1,'second').toDate()).getDate();
        if(day ==lastDay ){
            compareToMonthSearchTimeParams=[new Date(year, month-1, 1),
                moment(new Date(year, month-1, 1)).add(1,'month').add(-1, 'second').toDate()];
        }
        this.energyInfoCompareRP && this.energyInfoCompareRP.request.abort();
        this.energyInfoCompareRP = apis.energyInfo.getMultiTotal(
            {
                GroupId:c,
                TimeRanges:[{StartTime:moment(compareDaySearchTimeParams[0]).format(),EndTime:moment(compareDaySearchTimeParams[1]).format()},
                    {StartTime:moment(compareToDaySearchTimeParams[0]).format(),EndTime:moment(compareToDaySearchTimeParams[1]).format()},
                    {StartTime:moment(compareMonthSearchTimeParams[0]).format(),EndTime:moment(compareMonthSearchTimeParams[1]).format()},
                    {StartTime:moment(compareToMonthSearchTimeParams[0]).format(),EndTime:moment(compareToMonthSearchTimeParams[1]).format()}]
            }
        );
        this.setState({isLoadingCompare:true});

        this.registerRequest(this.energyInfoCompareRP.request);
        this.energyInfoCompareRP.promise.then((res)=>{
            if(!this.mounted)return;
            this.setState({
                compareData:res.Data,
                isLoadingCompare:false
            });

            let {compareData} = this.state;
            this.setState({energyTendencyData:[]});
            let dayIsAdd =  0;
            let  monthIsAdd = 0;
            if(compareData[1] == 0 && compareData[3] ==0){

            }else if(compareData[1] == 0){
                dayIsAdd =  0;
                 monthIsAdd = ((compareData[2] - compareData[3])/compareData[3]*100).toFixed(2);
            }else if(compareData[3] ==0){
                 dayIsAdd = ((compareData[0] - compareData[1])/compareData[1] *100).toFixed(2);
                monthIsAdd = 0;
            }else{
                 dayIsAdd = ((compareData[0] - compareData[1])/compareData[1] *100).toFixed(2);
                 monthIsAdd = ((compareData[2] - compareData[3])/compareData[3]*100).toFixed(2);
            }
            let dayAdd  = false;
            let monthAdd = false;
            if(dayIsAdd>=0){
                dayAdd = true;
            }
            if(monthIsAdd>=0){
                monthAdd = true;
            }
            this.setState({energyTendencyData:[[{
                num:compareData[0]?(compareData[0]).toFixed(2):0,
                isAdd: dayAdd ,
                changeNum:dayIsAdd+'%',
                name:'本日用电量'},
                {num:compareData[2]?(compareData[2]).toFixed(2):0,
                    isAdd: monthAdd,
                    changeNum:monthIsAdd+'%',
                    name:'本月用电量'}],
                [{num:compareData[1]?(compareData[1]).toFixed(2):0,
                    name:'昨日同期'},
                    {num:compareData[3]?(compareData[3]).toFixed(2):0,
                        name:'上月同期'}]]})

        }).catch((err)=>{
            if (!err.abort) {
                this.setState({
                    isLoadingCompare: false
                });
                alert(err.msg);
            }
        });


    }
    handleSearchTypeChange(obj) {
        let type = obj.value;
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate()-1;
        //按年查询
        if (type=== 0) {
            this.setState({
                searchType: staticType.timeBaseOnEnum.multiYear
            });
            this.areaSetSelectState(['start','end'],
                [
                    {value:moment(new Date(year, 0, 1)).add(-2, 'year').toDate()},
                    {value:moment(new Date(year, 0, 1)).add(1, 'year').add(-1, 'second').toDate()}
                ]);
        }
        else if (type === 1) {
            this.setState({
                searchType: staticType.timeBaseOnEnum.year
            });
            this.areaSetSelectState(['start','end'],
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
            this.areaSetSelectState(['start','end'],
                [
                    {value:moment(new Date(year, month, day)).add(-9, 'day').toDate()},
                    {value:moment(new Date(year, month, day)).add(1, 'day').add(-1,'second').toDate()}
                ]);
        }
        else {
            this.setState({
                searchType: staticType.timeBaseOnEnum.day
            });
            this.areaSetSelectState(['start','end'],
                [
                    {value: new Date(year, month, day)},
                    {value: moment(new Date(year, month, day)).add(1, 'day').add(-1,'second').toDate()}
                ]);
        }
    }
    chartsClick(e){
        let {treeData}= this.state;
        treeData&&treeData.map(t=>{
            if(e === t.name){
                this.setState({currentGroupId:t.value})
            }
        });
        this.search();
    }

    componentDidMount(){
        this.getGroupData()
    }

    render() {
        const {searchType,isLoadingHistoryData,isLoadingCompare,areaTypes,
            historyData,isLoadingGroup,currentGroupId,treeData,selectStates
            ,historyRankData,totalData,childGroups,energyTendencyData,isLoadingChildRank,treeDataClickLevel,topLevel} = this.state;

        let  areaTitle =(areaTypes[currentGroupId] ==undefined?'全部区域':areaTypes[currentGroupId]) ;
        let areaFormTitle = areaTitle + '用能明细';
        
        return (
            <div className="sem-has-middle-bar" onClick={()=>this.areaSetSelectState(null,{open:false})}>
                <SideCondition callback={()=>this.search()}>
                    <SideConditionChild  className="search" text="查询条件"  height="40%">
                        <Table align="left" noborder={true}>
                            <Table.Body className="side-search">
                                <tr>
                                    <td>
                                        显示类型：
                                        <MySelect onChange={(obj)=>{this.areaSetSelectState('searchTimeType',obj);}}
                                            {...selectStates.getSelect('searchTimeType')} style={{maxWidth:'130px'}}>
                                            {selectStates.getSelect('searchTimeType').open&&
                                            <SelectList {...selectStates.getSelect('searchTimeType')}
                                                onChange={(obj,cb)=>{this.areaSetSelectState('searchTimeType',obj,cb);this.handleSearchTypeChange(obj)}}
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
                                                            onChange={(obj)=>{this.areaSetSelectState('start',obj);}}/>
                                                <p>选择结束年份:</p>
                                                <DateSelect {...selectStates.getSelect('end')}
                                                            className="distanceX"
                                                            placeholder="结束年份"
                                                            endWith="year"
                                                            onChange={(obj)=>{
                                                                if(obj.value){
                                                                    obj.value = moment(obj.value).add(1,'year').add(-1,'second').toDate()
                                                                }
                                                                this.areaSetSelectState('end',obj);}
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
                                                            onChange={(obj)=>{this.areaSetSelectState('start',obj);}}/>
                                                <p>选择结束月份：</p>
                                                <DateSelect {...selectStates.getSelect('end')}
                                                            className="distanceX"
                                                            placeholder="选择结束月份"
                                                            endWith="month"
                                                            onChange={(obj)=>{
                                                                if(obj.value){
                                                                    obj.value = moment(obj.value).add(1,'month').add(-1,'second').toDate()
                                                                }
                                                                this.areaSetSelectState('end',obj);}}/>
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
                                                            onChange={(obj)=>{this.areaSetSelectState('start',obj);}}/>
                                                <p>选择结束日期：</p>
                                                <DateSelect {...selectStates.getSelect('end')}
                                                            className="distanceX"
                                                            placeholder="选择起始日期"
                                                            endWith="day"
                                                            onChange={(obj)=>{
                                                                if(obj.value){
                                                                    obj.value = moment(obj.value).add(1,'day').add(-1,'second').toDate()
                                                                }
                                                                this.areaSetSelectState('end',obj);}}/>
                                            </div>
                                        }
                                        {
                                            searchType === staticType.timeBaseOnEnum.day &&
                                            <div><p>选择日期：</p>
                                                <DateSelect {...selectStates.getSelect('start')}
                                                            className="distanceX"
                                                            placeholder="选择日期"
                                                            endWith="day"
                                                            date={new Date(2017,2,20)}
                                                            onChange={(obj)=>{
                                                                let endObj = Object.assign({},obj);
                                                                if(obj.value){
                                                                    endObj.value = moment(obj.value).add(1,'day').add(-1,'second').toDate()
                                                                }
                                                                this.areaSetSelectState(['start','end'],[obj,endObj]);}}/>
                                            </div>
                                        }
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
                    <SideConditionChild className="list" text="选择区域">
                        <div className="group-condition-wrapper">
                            {isLoadingGroup?<PreLoader/>
                                : (treeData?<TreeList data={treeData} onClick={(item)=>this.handleTreeList(item)}
                                                      handleCheck={(val)=>{this.setState({currentGroupId:val},()=>this.search(val));}}
                                                      isLoadingGroup={isLoadingGroup} value={currentGroupId}/>:<div></div>)}
                        </div>

                    </SideConditionChild>
                </SideCondition>

                <div className="sem-main-content" onClick={()=>this.areaSetSelectState(null,{open:false})}>
                    {
                        treeDataClickLevel<3 ?
                        <div className="charts-wrapper">
                            <div className="all-area-charts">
                                <div className="charts-total">总用电量：{totalData[0]?(totalData[0]).toFixed(2):0}</div>
                                { isLoadingChildRank?<PreLoader />
                                :(historyRankData.length? <AllAreaCharts data={historyRankData}
                                                                         name = {areaTitle}
                                                                         searchType={searchType}
                                                                         startTime={selectStates.getSelect('start').value}
                                                                         endTime={selectStates.getSelect('end').value}
                                                                         chartsClick={(e)=>this.chartsClick(e)}/>:
                                        <div style={{
                                               backgroundImage:`url(${icons.noArea})`,
                                               width: 190,
                                               height:156,
                                               position:'relative',
                                               top: '50%',
                                               left: '50%',
                                               marginLeft:-95,
                                               marginTop:-78
                                               }}>
                                        </div>
                                )
                                }
                            </div>
                        </div>:
                            <div className="charts-wrapper">
                                <div className="left line">
                                    <div className="charts-total">总用电量：{totalData[0]?(totalData[0]).toFixed(2):0}</div>
                                    {
                                        isLoadingHistoryData?<PreLoader />
                                            : <TotalCharts data={historyData} title={areaTitle} searchType={searchType}

                                        />
                                    }
                                </div>
                                <div className="right">
                                    <div className="pie">

                                        <span className="header-right">kWh</span>
                                        {
                                            isLoadingChildRank?<PreLoader />
                                                : (historyRankData.length?<AreaCharts data={historyRankData} title={areaTitle}/>:
                                                    <div style={{
                                        backgroundImage:`url(${icons.noArea})`,
                                        width: 190,
                                        height:156,
                                        position:'relative',
                                        top: '50%',
                                        left: '50%',
                                        marginLeft:-95,
                                        marginTop:-78
                                    }}>
                                                    </div>
                                            )
                                        }

                                    </div>

                                    <div className="word">
                                        {
                                            isLoadingCompare?<PreLoader />
                                                :<Statistics title="用能环比-总"
                                                             foots="kWh"
                                                             data={energyTendencyData}/>
                                        }
                                    </div>
                                </div>
                            </div>
                    }
                    
                    <div className="table-wrapper">
                        <PanelTable text={areaFormTitle}
                                    align="center"
                                    isLoading={isLoadingHistoryData}
                                    loadingText="正在获取数据"
                        >
                            {
                                !isLoadingHistoryData&&<div>
                                    <div style={{height:'33px'}} className="table-need-head">
                                        <Table>
                                            <thead>
                                            <tr>
                                                <Table.Th className="large">日期</Table.Th>
                                                <Table.Th className="min">总用电量</Table.Th>
                                                {
                                                    childGroups&&childGroups.map((t,i)=>{
                                                        return (
                                                            <Table.Th className="min" key={i}>{t.name}</Table.Th>
                                                        )
                                                    })
                                                }

                                            </tr>
                                            </thead>
                                            <Table.Body>
                                                {
                                                    historyData&&historyData.map((i,j)=>{
                                                        return(
                                                        <tr key={j}>
                                                            <td>
                                                                {i.formTime}
                                                            </td>
                                                            <td>
                                                                {i.TotalEle?i.TotalEle.toFixed(2):0}
                                                            </td>

                                                            {
                                                                childGroups&&childGroups.map((g,n)=>{
                                                                    return(
                                                                        <td key={n}>{i[g.name]?i[g.name].toFixed(2):0}</td>
                                                                    )
                                                                })
                                                            }
                                                        </tr>)
                                                    })
                                                }
                                            </Table.Body>
                                        </Table>
                                    </div>
                                    <div style={{height:'250px'}} className="table-need-body">
                                        <Table>
                                            <thead>
                                            <tr>
                                                <Table.Th className="large">日期</Table.Th>
                                                <Table.Th className="min">总用电量</Table.Th>
                                                {
                                                    childGroups&&childGroups.map((t,i)=>{
                                                        return (
                                                            <Table.Th className="min" key={i}>{t.name}</Table.Th>
                                                        )
                                                    })
                                                }

                                            </tr>
                                            </thead>
                                            <Table.Body>
                                                {
                                                    historyData&&historyData.map((i,j)=>{
                                                        return<tr key={j}>
                                                            <td>
                                                                {i.formTime}
                                                            </td>
                                                            <td>
                                                                {i.TotalEle?i.TotalEle.toFixed(2):0}
                                                            </td>
                                                            {
                                                                childGroups&&childGroups.map((g,k)=>{
                                                                    return(
                                                                        <td key={k}>{i[g.name]?i[g.name].toFixed(2):0}</td>
                                                                    )
                                                                })
                                                            }
                                                        </tr>
                                                    })
                                                }
                                            </Table.Body>
                                        </Table>
                                    </div>
                                </div>
                            }
                        </PanelTable>
                        <br/>
                    </div>
                </div>

            </div>
        )
    };
}


