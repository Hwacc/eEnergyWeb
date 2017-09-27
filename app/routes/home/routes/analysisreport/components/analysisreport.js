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
import './style.scss'
import PreLoader from 'redux-components/preloader'
import * as staticType from 'utils/staticType'
import moment from 'moment'
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import PanelTable from 'redux-components/paneltable'
import Table from 'redux-components/table'
import Button from 'redux-components/button'
import store from 'store'
import TendencyCharts from './effciency-tendency'
import {getParentNode,getWeek} from 'utils'
import icons from 'icons'
import CompareChats from './compare-charts'
import {DateSelect,DateSelectState} from 'redux-components/dropdownselect/datepicker'
import './style.scss'
import RankCharts from './all-area-charts'
import $ from 'jquery'
import html2canvas from 'html2canvas'
import screenHelper from '../../../../../utils/screenHelper'


export default class AnalysisReport extends BaseComponent {
    constructor(){
        super(...arguments);
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        let dateStates = new DateSelectState([
            ['start',{value:moment(new Date(year,month,1)).toDate(),isMini:true,endWith:'day'}],
            ['end',{value:moment(new Date(year,month,day)).add(-1,'second').toDate(),isMini:true,endWith:'day'}]

        ])
        this.state={
            searchType:staticType.timeBaseOnEnum.month,
            searchTimeParams: [moment(new Date(year,month,1)).toDate(),
                moment(new Date(year,month,day)).add(-1,'second').toDate()],
            //分组名称
            groupName:'',
            //管理区域
            community:null,
            //是否正在查询
            //当前选中分组
            activeGroupInfo:null,
            //分组号
            group:null,
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
            communityName:'',
            compareDataCompute:[],
            isLoadingTendency:false,
            useTypesDetailData:[],
            deviceRankData:{
                DeviceEnergyMaps:[]
            },
            logData:[],
            updateFlag:false,

        }
    }

    areaSetSelectState(type,obj,cb) {
        let { selectStates } = this.state
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
    //获取近30天用电曲线
    getTendencyData(c){
        let { selectStates, searchType , searchTimeParams} = this.state
        let time = new Date(selectStates.getSelect('start').value),
            year = time.getFullYear(),
            month = time.getMonth(),
            day = time.getDate();

        this.setState({
            isLoadingTendency:true,
            energyTendencyData:[]
        })
        let postData={
            GroupId:c,
            Form:searchType===staticType.timeBaseOnEnum.week?staticType.timeBaseOnEnum.month:searchType,
            StartTime:moment(searchTimeParams[0]).format('YYYY-MM-DD HH:mm:ss'),
            EndTime:moment(searchTimeParams[1]).format('YYYY-MM-DD HH:mm:ss')
        }
        this.ennergyTendencyRP&&this.ennergyTendencyRP.request.abort();
        this.ennergyTendencyRP = apis.energyInfo.getTrend(postData);
        this.registerRequest(this.ennergyTendencyRP.request);
        this.ennergyTendencyRP.promise
            .then(res=>{
            if(!this.mounted)return;
            this.setState({
                energyTendencyData:res.Data,
                isLoadingTendency:false
            })

        }).catch(err => {
            if (!err.abort) {
                this.setState({
                    isLoadingTendency:false
                })
                alert(err.msg);
            }
        })
    }

    /*获取区域管理列表*/
    getCommunityData() {
        let {selectStates} = this.state;
        let list = this.props.list
        if (list.length > 0) {
            let communityId = store.get('communityId');
            let communityName = ''
            list.some(i => {
                if (i.value === communityId) {
                    communityName = i.name
                }
            });
            this.setState({
                isLoadingGroup: true,
                treeData: [],
                updateFlag:true,
            },()=>this.search(communityId));
        }else{
            this.setState({updateFlag:false});
        }
    }

    handleTreeList(item){
        let data = this.state.treeData;
        data = Tree.setShow(item,data);
        this.setState({treeData:data})
    }

    //查询
    search(communityId) {
        let c = communityId || store.get('communityId')
        this.getCompareData(c);
        // this.getChildRank(c);
        this.getGroupData(c);
        this.getTendencyData(c);
        this.getLog();
    }
    /*获取分组*/
    getGroupData(id) {
        this.groupRP && this.groupRP.request.abort();
        if (!id && id == 0)return;
        this.groupRP = apis.group.getGroupListByCommunityID(id);
        this.registerRequest(this.groupRP.request);
        this.setState({
            isLoadingGroup: true,
            treeData: [],
            currentGroupId: id,
        });
        this.groupRP.promise
            .then((res) => {
                let data = res.Data || [];
                let searchId;
                data.map((item)=>{
                    if(item.Level == 2){
                        searchId = item.Id;
                    }
                });
                if(searchId){
                    this.getChildRank(searchId);
                }
            })
            .catch((err) => {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingGroup: false
                    })

                }
            })
    }
    //导出
    upload(){
        let exportPdf = $(this.refs.exportPdf)
        let scale = window.devicePixelRatio
        window.scrollTo(0,0);
        exportPdf.addClass('export')
        let evt = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: false
        })
        window.scrollTo(0,0)
        html2canvas(exportPdf.get(0),{scale:scale}).then(canvas => {
            let src = canvas.toDataURL("image/png")
            let a = document.createElement('a')
            a.href = src
            a.download = '分析报告'
            a.target = '_blank';
            a.dispatchEvent(evt)
            exportPdf.removeClass('export')
        })

    }
    //查找最小最大
    getBestNum(type, data, key){
        let result = 0
        if(type === 'sortByMax'){
            result = data || []
            let length = result.length
            for(let i = 0; i < length -1 ; i++){
                for(let j = 0;j< length - i - 1; j++){
                    if(result[j][key] < result[j+1][key]){
                        let temp = data[j]
                        result[j] = result[j+1]
                        result[j+1] = temp
                    }
                }
            }
            return result
        }
        if(type === 'sortByMin'){
            result = data || []
            let length = result.length
            for(let i = 0; i < length -1 ; i++){
                for(let j = 0;j< length - i - 1; j++){
                    if(result[j][key] > result[j+1][key]){
                        let temp = data[j]
                        result[j] = result[j+1]
                        result[j+1] = temp
                    }
                }
            }
            return result
        }
        if(data.length>0&&type!='sortByMax'&&type!='sortBymin'){
            let temp = data[0]
            result = Object.assign({},temp)
            if(type === 'max'){
                data.map(i => {
                    if(i[key] > result[key]){
                        result = Object.assign({},result,i)
                    }
                })
                return result
            }
            if(type === 'min'){
                data.map(i => {
                    if(i[key] < result[key]){
                        result = Object.assign({},result,i)
                    }
                })

                return result
            }
            if(type === 'average'){
                result[key] = 0
                data.map(i => {
                    result[key] += i[key]
                })
                result[key] = (result[key]/data.length).toFixed(2)
                return result
            }
        } else {
            return result
        }
    }
    //分组排行
    getChildRank(c){
        let {selectStates,searchType,searchTimeParams} = this.state
        let time = new Date(selectStates.getSelect('start').value),
            year = time.getFullYear(),
            month = time.getMonth(),
            day = time.getDate()
        this.setState({
            isLoadingChildRank: true,
            historyRankData: []
        })
        let postData={
            Form:2,
            GroupId:c,
            StartTime:moment(searchTimeParams[0]).format('YYYY-MM-DD HH:mm:ss'),
            EndTime:moment(searchTimeParams[1]).format('YYYY-MM-DD HH:mm:ss')
        };
        this.energyInfoRankRP && this.energyInfoRankRP.request.abort()
        this.energyInfoRankRP = apis.energyInfo.getChildRank(postData)
        this.registerRequest(this.energyInfoRankRP.request)
        this.energyInfoRankRP.promise
            .then((res)=> {
                if(!this.mounted)return
                let data = res.Data || []
                let total = 0
                let head = ['区域','排名','本月总用电量(kWh)','占比']
                let body = []
                data.map((i,j) => {
                    total += i.TotalEle
                })
                data.map((i,j)=>{
                    let temp = [i.GroupName,j+1,i.TotalEle.toFixed(2),(i.TotalEle/total*100).toFixed(2)+'%']
                    body.push(temp)
                })
                let historyRankData = {
                    data:data,
                    total : total,
                    head:head,
                    body:body
                }
                this.setState({
                    isLoadingChildRank: false,
                    historyRankData: historyRankData,
                })
                this.getRanking(c)
            })
            .catch((err)=> {
            console.log(err)
                if (!err.abort) {
                    this.setState({
                        isLoadingChildRank: false
                    });
                    alert(err.msg);
                }
            });
    }
    //设备排行
    getRanking(c){
        let {selectStates,searchType,searchTimeParams} = this.state
        let time = new Date(selectStates.getSelect('start').value),
            year = time.getFullYear(),
            month = time.getMonth(),
            day = time.getDate()
        this.setState({
            isLoadingRank: true,
            deviceRankData: []
        })
        let data = {
            Form:2,
            GroupId : c,
            StartTime:moment(searchTimeParams[0]).format('YYYY-MM-DD HH:mm:ss'),
            EndTime:moment(searchTimeParams[1]).format('YYYY-MM-DD HH:mm:ss')
        }
        this.energyInfoRankRP && this.energyInfoRankRP.request.abort()
        this.energyInfoRankRP = apis.energyInfo.getRankings(data)
        this.registerRequest(this.energyInfoRankRP.request)
        this.energyInfoRankRP.promise
            .then((res)=> {
                if(!this.mounted)return
                this.setState({
                    isLoadingRank: false,
                    deviceRankData: res.Data || {
                        Total:0,
                        DeviceEnergyMaps:[]
                    }
                })
            })
            .catch((err)=> {
                console.log(err)

                if (!err.abort) {
                    this.setState({
                        isLoadingRank: false
                    })
                    alert(err.msg)
                }
            })
    }

    // 获取设备离线日志
    getLog(c){
        let { selectStates, searchType,searchTimeParams}  = this.state
        let communityId = store.get('communityId')
        let time = new Date(selectStates.getSelect('start').value),
            year = time.getFullYear(),
            month = time.getMonth(),
            day = time.getDate()
        this.logDetailRP && this.logDetailRP.request.abort()
        this.setState({
            isLoadingLog:true,
            logData: []
        });
        this.logDetailRP = apis.logs.getExceptionList({
            GroupId:communityId,
            Ltype:3,
            ObjName:'',
            OperType:4,
            Start:moment(searchTimeParams[0]).format('YYYY-MM-DD HH:mm:ss'),
            End:moment(searchTimeParams[1]).format('YYYY-MM-DD HH:mm:ss')
        },0,100);
/*        this.logDetailRP = apis.device.OnOffline({
            Form:2,
            GroupId:communityId,
            StartTime:moment(searchTimeParams[0]).format('YYYY-MM-DD HH:mm:ss'),
            EndTime:moment(searchTimeParams[1]).format('YYYY-MM-DD HH:mm:ss')
        })*/
        console.log('logDetailRp = '+this.logDetailRP);
        this.registerRequest(this.logDetailRP.request)
        this.logDetailRP.promise
            .then(res => {
                if(!this.mounted)return
                let data = res[0].Data || []
                this.setState({
                    logData:data,
                    isLoadingLog:false
                })
            })
            .catch(err => {
                console.log(err.message);

                if (!err.abort) {
                    this.setState({
                        isLoadingLog:false,
                        logData: []
                    })
                    alert(err.msg)
                }

            })
    }

    //获取比较统计
    getCompareData(c){
        const { selectStates,searchType,searchTimeParams} = this.state;

        this.energyInfoCompareRP && this.energyInfoCompareRP.request.abort();
        let time = new Date(selectStates.getSelect('start').value),
            year = time.getFullYear(),
            month = time.getMonth(),
            day = time.getDate()

        let compareDaySearchTimeParams = [];
        let compareMonthSearchTimeParams = [];
        let compareToDaySearchTimeParams =[];
        let compareToMonthSearchTimeParams =[];

        //月
        if(searchType==2){

             compareDaySearchTimeParams =[new Date(year, month, 1),
                    moment(new Date(year, month, 1)).add(1, 'month').add(-1, 'second').toDate()];
            //昨年同比电量
                compareToDaySearchTimeParams = [new Date(year-1, month, 1),
                    moment(new Date(year-1, month, 1)).add(1, 'month').add(-1, 'second').toDate()];
            //本月电量
                compareMonthSearchTimeParams = [new Date(year, month, 1),
                    moment(new Date(year, month, 1)).add(1, 'month').add(-1, 'second').toDate()];
            //上月
                compareToMonthSearchTimeParams = [new Date(year, month-1, 1),
                    moment(new Date(year, month, 1)).add(-1, 'second').toDate()]
        }else if(searchType ==4){//周
            let lastMonthDay = moment(time).add(-1,'month').toDate();
            let weekNum = lastMonthDay.getDay();
            let start  = moment(lastMonthDay).add(-weekNum+1,'day').toDate()
            let end = moment(lastMonthDay).add(8-weekNum,'day').add(-1,'second').toDate()
            let startW  = moment(time).add(-7,'day').toDate();
            let endW = moment(time).add(-1, 'second').toDate();

            compareDaySearchTimeParams =[selectStates.getSelect('start').value,
                selectStates.getSelect('end').value];
            //同比电量
            compareToDaySearchTimeParams = [start,end];
            //本月电量
            compareMonthSearchTimeParams = [selectStates.getSelect('start').value,
                selectStates.getSelect('end').value];
            //上月
            compareToMonthSearchTimeParams = [startW,endW]

        }else if(searchType==3){//日
            compareDaySearchTimeParams =[new Date(year, month, day),
                moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()];
            //昨年同比电量
            compareToDaySearchTimeParams = [new Date(year, month-1, day),
                moment(new Date(year, month-1, day)).add(1, 'day').add(-1, 'second').toDate()];
            //本月电量
            compareMonthSearchTimeParams = [new Date(year, month, day),
                moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()];
            //上月
            compareToMonthSearchTimeParams = [new Date(year, month, day-1),
                moment(new Date(year, month, day)).add(-1, 'second').toDate()]


        }

/*
        let now = new Date()
        let day = now.getDate()
        if(moment(new Date(selectStates.getSelect('start').value)).format() == moment(new Date(now.getFullYear(),now.getMonth(),1)).format()
        && now.getDate()<new Date(now.getFullYear(),now.getMonth()+1,0).getDate()){
            compareDaySearchTimeParams =[new Date(year, month, 1),
                moment(new Date(year, month, day)).add(1,'day').add(-1, 'second').toDate()],
                //昨年同比电量
                compareToDaySearchTimeParams = [new Date(year-1, month, 1),
                    moment(new Date(year-1, month, day)).add(1,'day').add(-1, 'second').toDate()],
                //本月电量
                compareMonthSearchTimeParams = [new Date(year, month, 1),
                    moment(new Date(year, month, day)).add(1,'day').add(-1, 'second').toDate()],
                //上月
                compareToMonthSearchTimeParams = [moment(new Date(year, month, 1)).add(-1,'month'),
                    moment(new Date(year, month, day)).add(-1,'month').add(1,'day').add(-1, 'second').toDate()]
        }*/
        this.energyInfoCompareRP = apis.energyInfo.getMultiTotal(
            {
                GroupId:c,
                TimeRanges:[{StartTime:moment(compareDaySearchTimeParams[0]).format(),EndTime:moment(compareDaySearchTimeParams[1]).format()},
                    {StartTime:moment(compareToDaySearchTimeParams[0]).format(),EndTime:moment(compareToDaySearchTimeParams[1]).format()},
                    {StartTime:moment(compareMonthSearchTimeParams[0]).format(),EndTime:moment(compareMonthSearchTimeParams[1]).format()},
                    {StartTime:moment(compareToMonthSearchTimeParams[0]).format(),EndTime:moment(compareToMonthSearchTimeParams[1]).format()}]
            }
        );
        this.setState({
            isLoadingCompare:true,
            compareDataCompute:[],
            compareData:[]
        })


        this.registerRequest(this.energyInfoCompareRP.request);
        this.energyInfoCompareRP.promise.then((res)=>{
            if(!this.mounted)return;
            this.setState({
                compareData:res.Data,
                isLoadingCompare:false
            });

            let {compareData} = this.state;
            let dayIsAdd =  0;
            let  monthIsAdd = 0;
            if(compareData[1] == 0 && compareData[3] ==0){

            }else if(compareData[1] == 0){
                dayIsAdd =  100;
                 monthIsAdd = ((compareData[2] - compareData[3])/compareData[3]*100).toFixed(2);
            }else if(compareData[3] ==0){
                 dayIsAdd = ((compareData[0] - compareData[1])/compareData[1] *100).toFixed(2);
                monthIsAdd = 100;
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
            this.setState({compareDataCompute:[[{
                num:compareData[0]?(compareData[0]).toFixed(2):0,
                isAdd: dayAdd ,
                changeNum:Math.abs(dayIsAdd)+'%',
                name:'本日用电量'},
                {num:compareData[2]?(compareData[2]).toFixed(2):0,
                    isAdd: monthAdd,
                    changeNum:Math.abs(monthIsAdd)+'%',
                    name:'本月用电量'}],
                [{num:compareData[1]?(compareData[1]).toFixed(2):0,
                    name:'昨日同期'},
                    {num:compareData[3]?(compareData[3]).toFixed(2):0,
                        name:'上月同期'}]]})

        }).catch((err)=>{
            console.log(err)

            if (!err.abort) {
                this.setState({
                    isLoadingCompare: false,
                    compareDataCompute:[],
                    compareData:[]
                });
                alert(err.msg);
            }
        });


    }

    componentDidMount(){
        this.getCommunityData();
        let zoom = document.body.style.zoom
        let windowHeight = screenHelper().get('windowHeight');
        this.setState({windowHeight:windowHeight});
    }
    componentDidUpdate(){
        if(this.props.list.length>0 && !this.state.updateFlag){
            this.getCommunityData();
        }
    }

    handleSearchTypeChange(obj,time,cb) {
        if(time.value){
            let now = moment(time.value).toDate();
            let year = now.getFullYear();
            let month = now.getMonth();
            let day = now.getDate();
            let realNow = new Date();
            let realYear = realNow.getFullYear();
            let realMonth = realNow.getMonth();
            let realDay = realNow.getDate();
            //按年查询
            if (obj=== staticType.timeBaseOnEnum.day) {
                this.areaSetSelectState(['start','end'],
                    [
                        Object.assign({},time,{value:moment(new Date(year, month, day)).toDate()}),
                        Object.assign({},time,{value:moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()})
                    ]);
                this.setState({
                    searchType: staticType.timeBaseOnEnum.day,
                    searchTimeParams:[moment(new Date(year, month, day)).toDate(),
                        moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()]
                },()=>{cb&&cb()});
            }
            else if (obj === staticType.timeBaseOnEnum.week) {
                let week = now.getDay();
                if(week ==0){
                    week = 7
                }
                this.areaSetSelectState(['start','end'],
                    [
                        Object.assign({},time,{value:moment(new Date(year, month, day)).toDate()}),
                        Object.assign({},time,{value:moment(new Date(year, month, day)).add(1, 'day').add(-1,'second').toDate()})
                    ]);
                let endDate =  moment(new Date(year, month, day)).add(8-week, 'day').add(-1,'second').toDate();
                if(endDate.getDate()>realDay){
                    endDate = moment(new Date(realYear,realMonth,realDay)).add(1,'day').add(-1,'second').toDate();
                }
                this.setState({
                    searchType: staticType.timeBaseOnEnum.week,
                    searchTimeParams:[moment(new Date(year, month, day)).add(-week+1,'day').toDate(),endDate]
                },()=>{cb&&cb()});
            }
            //按月查询
            else if (obj === staticType.timeBaseOnEnum.month) {
                if(realMonth == month){
                    this.areaSetSelectState(['start','end'],
                        [
                            Object.assign({},time,{value:moment(new Date(realYear, realMonth, 1)).toDate()}),
                            Object.assign({},time,{value:moment(new Date(realYear, realMonth,realDay)).add(-1, 'second').toDate()})
                        ]);
                    this.setState({
                        searchType: staticType.timeBaseOnEnum.month,
                        searchTimeParams:[moment(new Date(realYear, realMonth, 1)).toDate(),moment(new Date(realYear ,realMonth,realDay)).add(-1, 'second').toDate()]

                    },()=>{cb&&cb()});
                }else{
                    this.areaSetSelectState(['start','end'],
                        [
                            Object.assign({},time,{value:moment(new Date(year, month, 1)).toDate()}),
                            Object.assign({},time,{value:moment(new Date(year, month+1,1)).add(-1, 'second').toDate()})
                        ]);
                    this.setState({
                        searchType: staticType.timeBaseOnEnum.month,
                        searchTimeParams:[moment(new Date(year, month, 1)).toDate(),moment(new Date(year,month+1,1)).add(-1, 'second').toDate()]
                    },()=>{cb&&cb()});
                }
            }
            else {
                this.setState({
                    searchType: staticType.timeBaseOnEnum.day
                });
                this.areaSetSelectState(['start','end'],
                    [
                        Object.assign({},time,{value:new Date(year, month, day)}),
                        Object.assign({},time,{value: moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()})
                    ]);
            }
        }else {
            this.areaSetSelectState('start',time)
        }
    }
    render() {
        const {isLoadingTendency,isLoadingCompare,compareData,isUpload,isLoadingRank,deviceRankData,
            compareDataCompute,historyRankData,isLoadingChildRank,logData, isLoadingLog,
            selectStates,communityName, energyTendencyData,searchType,windowHeight} = this.state
        let time = selectStates.getSelect('start').value
        let minObj = this.getBestNum('min',energyTendencyData,'Total')
        let maxObj = this.getBestNum('max',energyTendencyData,'Total')
        let averageObj = this.getBestNum('average',energyTendencyData,'Total')
        let sortRankData = this.getBestNum('sortByMax',historyRankData.data,'TotalEle')
        let useTypesDetailData = this.getBestNum('sortByMax',this.state.useTypesDetailData,'value')
        let useTotal = 0
        useTypesDetailData&&useTypesDetailData.map(i => {
            useTotal += i.value*1
        })
        let normalDevice = 0
        logData&&logData.map(i => {
            if(i.RecoveryTime){
                normalDevice++
            }
        })
        let deviceTotal = 0
        deviceRankData.DeviceEnergyMaps&&deviceRankData.DeviceEnergyMaps.map(i => {
            deviceTotal += i.Power
        })
        return (
            <div className="sem-has-middle-bar analysis" onClick={() => this.areaSetSelectState(null,{open:false})}>
                <SideCondition callback={() => this.search()}>
                    <SideConditionChild className="search" style={{height: '30%'}}>
                        <div className="side-search">
                            <div className="search-title">查询条件</div>
                            <div className="search-child">
                                报告类型：
                                {
                                    searchType === staticType.timeBaseOnEnum.day &&
                                    <div>
                                        <Button className="btn"
                                                onClick={()=>this.handleSearchTypeChange(staticType.timeBaseOnEnum.day,{value:new Date()},()=>this.search())}>日</Button>
                                        <Button className="btn" type="outline" size="thin"
                                                onClick={()=>this.handleSearchTypeChange(staticType.timeBaseOnEnum.week,{value:new Date()},()=>this.search())}>周</Button>
                                        <Button className="btn" size="thin"  type="outline"  style={{marginRight: 20}}
                                                onClick={()=>this.handleSearchTypeChange(staticType.timeBaseOnEnum.month,{value:new Date()},()=>this.search())}>月</Button>
                                    </div>
                                }
                                {
                                    searchType === staticType.timeBaseOnEnum.week &&
                                    <div>
                                        <Button className="btn"  type="outline" size="thin"
                                                onClick={()=>this.handleSearchTypeChange(staticType.timeBaseOnEnum.day,{value:new Date()},()=>this.search())}>日</Button>
                                        <Button className="btn"
                                                onClick={()=>this.handleSearchTypeChange(staticType.timeBaseOnEnum.week,{value:new Date()},()=>this.search())}>周</Button>
                                        <Button className="btn" size="thin" type="outline" style={{marginRight: 20}}
                                                onClick={()=>this.handleSearchTypeChange(staticType.timeBaseOnEnum.month,{value:new Date()},()=>this.search())}>月</Button>
                                    </div>
                                }
                                {
                                    searchType === staticType.timeBaseOnEnum.month &&
                                    <div>
                                        <Button className="btn" size="thin" type="outline"
                                                onClick={()=>this.handleSearchTypeChange(staticType.timeBaseOnEnum.day,{value:new Date()},()=>this.search())}>日</Button>
                                        <Button className="btn" size="thin" type="outline"
                                                onClick={()=>this.handleSearchTypeChange(staticType.timeBaseOnEnum.week,{value:new Date()},()=>this.search())}>周</Button>
                                        <Button className="btn"   style={{marginRight: 20}}
                                                onClick={()=>this.handleSearchTypeChange(staticType.timeBaseOnEnum.month,{value:new Date()},()=>this.search())}>月</Button>
                                    </div>
                                }
                            </div>
                            <div className="search-child">
                                选择时间：
                                {
                                    searchType === staticType.timeBaseOnEnum.day &&
                                        <DateSelect {...selectStates.getSelect('start')}
                                                    placeholder="选择日期"
                                                    endWith="day"
                                                    style={{width: '43.8%',height:'36px'}}
                                                    onChange={(obj)=>{this.handleSearchTypeChange(staticType.timeBaseOnEnum.day,obj);}}/>
                                }
                                {
                                    searchType === staticType.timeBaseOnEnum.week &&
                                        <DateSelect {...selectStates.getSelect('start')}
                                                    placeholder="选择日期"
                                                    endWith="day"
                                                    style={{width: '43.8%',height:'36px'}}
                                                    onChange={(obj)=>{this.handleSearchTypeChange(staticType.timeBaseOnEnum.week,obj);}}/>
                                }
                                {
                                    searchType === staticType.timeBaseOnEnum.month &&
                                        <DateSelect {...selectStates.getSelect('start')}
                                                    placeholder="月份"
                                                    endWith="month"
                                                    style={{width: '43.8%',height:'36px'}}
                                                    onChange={(obj)=>this.handleSearchTypeChange(staticType.timeBaseOnEnum.month,obj)}/>
                                }
                            </div>
                            <div className="search-child" style={{display:'block'}}>
                                <Button className="search-button" onClick={() => this.search()}>生成报告</Button>
                            </div>
                        </div>
                    </SideConditionChild>
                </SideCondition>
                <div className="sem-main-content" ref="exportPdf">
                    <div className="charts-module">
                        <div className="tool">
                            <div className="module-title">用电对比</div>
                        </div>
                        <div className="word">
                            <div className="icon image" style={{backgroundImage:`url(${icons.report})`}}>
                            </div>
                            <div className="word-data">
                                本{staticType.typeToString[searchType]}总用电量<span style={ { color:compareDataCompute.length > 0 && compareDataCompute[0][1].isAdd? "#fd8888":"#00bc1d" } }>
                                {compareData[0]?compareData[0].toFixed(2):0}kWh</span>,总用电量比上一{staticType.typeToString[searchType]}
                                <span style={ { color:compareDataCompute.length > 0 && compareDataCompute[0][1].isAdd? "#fd8888":"#00bc1d" } }>
                                { compareDataCompute.length > 0 && compareDataCompute[0][1].isAdd? "增加":'降低'}
                                { compareDataCompute.length > 0 && compareDataCompute[0][1].changeNum}</span>，比
                                {searchType===staticType.timeBaseOnEnum.month?'去年':'上月'}同{staticType.typeToString[searchType]}
                                <span style={ { color:compareDataCompute.length > 0 && compareDataCompute[0][0].isAdd? "#fd8888":"#00bc1d" } }>
                                { compareDataCompute.length > 0 && compareDataCompute[0][0].isAdd? "增加":'降低' }
                                { compareDataCompute.length > 0 && compareDataCompute[0][0].changeNum }
                                </span>。
                            </div>
                        </div>
                        <div className="charts compare">
                            <PreLoader show={isLoadingCompare}/>
                            {
                                (searchType === staticType.timeBaseOnEnum.month &&!isLoadingCompare)&&
                                <div className="charts-main">
                                <CompareChats data={ compareData.slice(2, 4) }
                                names={ [moment(time).format('YYYY-M'),
                                moment(time).add(-1,'month').format('YYYY-M')] }
                                title={ `${communityName}用电环比` }
                                style={{width:'50%'}}/>
                                <CompareChats data={ compareData.slice(0, 2) }
                                names={ [moment(time).format('YYYY-M'),
                                moment(time).add(-1,'year').format('YYYY-M')] }
                                title={ `${communityName}用电同比` }
                                style={{width:'50%'}}/>
                                </div>

                            }
                            {
                                (searchType === staticType.timeBaseOnEnum.week &&!isLoadingCompare)&&
                                <div className="charts-main">
                                <CompareChats data={ compareData.slice(2, 4) }
                                names={ ['本周','上周'] }
                                title={ `${communityName}用电环比` }
                                style={{width:'50%'}}/>
                                <CompareChats data={ compareData.slice(0, 2) }
                                names={ ['本周','上月同周']}
                                title={ `${communityName}用电同比` }
                                style={{width:'50%'}}/>
                                </div>

                            }
                            {
                                (searchType === staticType.timeBaseOnEnum.day &&!isLoadingCompare)&&
                                <div className="charts-main">
                                    <CompareChats data={ compareData.slice(2, 4) }
                                                  names={ [moment(time).format('YYYY-M-D'),
                                moment(time).add(-1,'day').format('YYYY-M-D')] }
                                                  title={ `${communityName}用电环比` }
                                                  style={{width:'50%'}}/>
                                    <CompareChats data={ compareData.slice(0, 2) }
                                                  names={ [moment(time).format('YYYY-M-D'),
                                moment(time).add(-1,'Month').format('YYYY-M-D')] }
                                                  title={ `${communityName}用电同比` }
                                                  style={{width:'50%'}}/>
                                </div>

                            }

                        </div>

                    </div>
                    <div className="charts-module">
                        <div className="tool">
                            <div className="module-title">用电曲线</div>
                        </div>
                        <div className="word">
                            <div className="icon image" style={{backgroundImage:`url(${icons.report})`}}>

                            </div>
                            {
                                (searchType === staticType.timeBaseOnEnum.month||
                                searchType === staticType.timeBaseOnEnum.week)&&energyTendencyData.length!=0
                                &&
                                <div className="word-data">
                                    本{staticType.typeToString[searchType]}每日平均用电<span>{averageObj.Total}kWh</span>，用电量最高的是
                                    <span>{moment(maxObj.StatisticTime).format('M月D日')}</span>，
                                    用电量为<span>{maxObj.Total?maxObj.Total.toFixed(2):0}kWh</span>；
                                    用电量最低的是<span>{moment(minObj.StatisticTime).format('M月D日')}</span>，
                                    用电量为<span>{minObj.Total?minObj.Total.toFixed(2):0}kWh</span>。
                                </div>
                            }
                            {
                                (searchType === staticType.timeBaseOnEnum.month||
                                searchType === staticType.timeBaseOnEnum.week)&&energyTendencyData.length==0
                                &&
                                <div className="word-data">
                                    本{staticType.typeToString[searchType]}用电曲线未获取
                                </div>
                            }
                            {
                                (searchType === staticType.timeBaseOnEnum.day)
                                &&
                                <div className="word-data">
                                    本{staticType.typeToString[searchType]}每小时平均用电<span>{averageObj.Total}kWh</span>，用电量最高的是
                                    <span>{moment(maxObj.StatisticTime).format('M月D日H时')}</span>，
                                    用电量为<span>{maxObj.Total?maxObj.Total.toFixed(2):0}kWh</span>；
                                    用电量最低的是<span>{moment(minObj.StatisticTime).format('M月D日H时')}</span>，
                                    用电量为<span>{minObj.Total?minObj.Total.toFixed(2):0}kWh</span>。
                                </div>
                            }
                        </div>
                        <div className="charts">
                            <PreLoader show={isLoadingTendency}/>
                            {
                                !isLoadingTendency&&energyTendencyData.length !=0 &&
                                <div className="charts-main">
                                    <TendencyCharts  data={energyTendencyData}  searchType={searchType} />
                                </div>
                            }
                        </div>

                    </div>
                    <div className="charts-module">
                        <div className="tool">
                            <div className="module-title">区域用电排行</div>
                        </div>
                        <div className="word">
                            <div className="icon image" style={{backgroundImage:`url(${icons.report})`}}>

                            </div>
                            {
                                (sortRankData[0]&&compareData[0])?
                                <div className="word-data">
                                    本{staticType.typeToString[searchType]}用电量最多的区域是<span>{sortRankData[0].GroupName}</span>，
                                    共用电<span>{sortRankData[0].TotalEle.toFixed(2)}kWh</span>，
                                    占总用电量的<span>{(sortRankData[0].TotalEle/compareData[0]*100).toFixed(2)+'%'}</span>,
                                    用电量前十名区域占总用电量的<span>{(historyRankData.total/compareData[0]*100).toFixed(2)+'%'}</span>。
                                </div>:<div/>
                            }
                        </div>
                        <div className="charts table">
                            <div className="charts-main">
                                <div className="table-wrapper">
                                    <PanelTable text={'区域用电排行'}
                                                align="center"
                                                isLoading={isLoadingChildRank}
                                                loadingText="正在获取数据"
                                    >
                                        {
                                            !isLoadingChildRank&&
                                            <div>
                                                {/*<div style={{height:'33px'}} className="table-need-head">
                                                    <Table>
                                                        <thead>
                                                        <tr>
                                                            <Table.Th className="large">区域</Table.Th>
                                                            <Table.Th className="min">排名</Table.Th>
                                                            <Table.Th className="min">本月总用电量(kWh)</Table.Th>
                                                            <Table.Th className="min">占比</Table.Th>

                                                        </tr>
                                                        </thead>
                                                        <Table.Body>
                                                            {
                                                                sortRankData&&sortRankData.map((i,j)=>{
                                                                    return(
                                                                        <tr key={j}>
                                                                            <td>
                                                                                {i.GroupName}
                                                                            </td>
                                                                            <td>{j+1}</td>
                                                                            <td>{i.TotalEle}</td>
                                                                            <td>{(i.TotalEle/compareData[0]*100).toFixed(2)+'%'}</td>
                                                                        </tr>)
                                                                })
                                                            }
                                                        </Table.Body>
                                                    </Table>
                                                </div>*/}
                                                <div style={{height:'190px',marginTop:'0px',overflowY:'scroll'}} className="table-need-body">
                                                    <Table>
                                                        <thead>
                                                        <tr>
                                                            <Table.Th className="large">区域</Table.Th>
                                                            <Table.Th className="min">排名</Table.Th>
                                                            <Table.Th className="min">本月总用电量(kWh)</Table.Th>
                                                            <Table.Th className="min">占比</Table.Th>

                                                        </tr>
                                                        </thead>
                                                        <Table.Body>
                                                            {
                                                                sortRankData&&sortRankData.map((i,j)=>{
                                                                    return(
                                                                        <tr key={j}>
                                                                            <td>
                                                                                {i.GroupName}
                                                                            </td>
                                                                            <td>{j+1}</td>
                                                                            <td>{i.TotalEle.toFixed(2)}</td>
                                                                            <td>{(i.TotalEle/compareData[0]*100).toFixed(2)+'%'}</td>
                                                                        </tr>
                                                                    )
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
                        <div className="charts">
                            <PreLoader shwo={isLoadingChildRank}/>
                            {
                                !isLoadingChildRank &&
                                <div className="charts-main">

                                    <span className="charts-total">总用电量：{compareData[0] ? compareData[0].toFixed(2) :0 }</span>
                                    <RankCharts data={sortRankData}
                                                name = {communityName}
                                                time={selectStates.getSelect('start').value}
                                    />
                                </div>
                            }
                        </div>
                    </div>
                    <div className="charts-module">
                        <div className="tool">
                            <div className="module-title">设备用电排行</div>
                        </div>
                        <div className="word">
                            <div className="icon image" style={{backgroundImage:`url(${icons.report})`}}>

                            </div>
                            {
                                (deviceRankData.DeviceEnergyMaps&&deviceRankData.DeviceEnergyMaps[0]&&compareData[0])?
                                <div className="word-data">
                                    本{staticType.typeToString[searchType]}用电量最多的设备是<span>{deviceRankData.DeviceEnergyMaps[0].DeviceNick}</span>,
                                    共用电<span>{deviceRankData.DeviceEnergyMaps[0].Power.toFixed(2)}kWh</span>，
                                    占总用电量的<span>{(deviceRankData.DeviceEnergyMaps[0].Power/compareData[0]*100).toFixed(2)+'%'}</span>,
                                    用电量前十名的设备占总用电量的<span>{(deviceTotal/compareData[0]*100).toFixed(2)+'%'}</span>。
                                </div>:
                                    <div/>
                            }
                        </div>
                        <div className="charts">
                            <PreLoader shwo={isLoadingRank}/>
                            {
                                !isLoadingRank &&
                                <div className="charts-main">
                                    <span className="charts-total">总用电量：{compareData[0] ? compareData[0].toFixed(2) :0 }</span>
                                    <RankCharts data={deviceRankData.DeviceEnergyMaps}
                                                name = {communityName}
                                                time={selectStates.getSelect('start').value}
                                    />
                                </div>
                            }
                        </div>
                    </div>
                    <div className="charts-module">
                        <div className="tool">
                            <div className="module-title">设备异常统计</div>
                        </div>
                        <div className="word">
                            <div className="icon image" style={{backgroundImage:`url(${icons.report})`}}>

                            </div>
                            {
                                logData[0]?
                                <div className="word-data">
                                    本{staticType.typeToString[searchType]}曾离线的设备共<span>{logData.length}</span>，
                                    恢复正常<span>{normalDevice}</span>，
                                    涉及设备如下。
                                </div>:<div className="word-data">
                                    暂无设备异常
                                </div>
                            }
                        </div>

                        {
                            logData[0]?<div className="charts useType">
                                <PreLoader show={isLoadingLog}/>
                                {
                                    !isLoadingLog&&
                                    <div className="charts-main">
                                        <div className="table-wrapper" style={{width:'100%',marginRight:'0px'}}>
                                            <PanelTable text={'设备异常统计'}
                                                        align="center"
                                                        isLoading={isLoadingLog}
                                                        loadingText="正在获取数据"
                                            >
                                                {
                                                    !isLoadingLog&&
                                                    <div>
                                                       {/* <div style={{height:'33px'}} className="table-need-head">
                                                            <Table>
                                                                <thead>
                                                                <tr>
                                                                    <Table.Th className="large">设备名称</Table.Th>
                                                                    <Table.Th className="min">离线时间</Table.Th>
                                                                    <Table.Th className="min">恢复时间</Table.Th>

                                                                </tr>
                                                                </thead>
                                                                <Table.Body>
                                                                    {
                                                                        logData&&logData.map((i,j)=>{
                                                                            return(
                                                                                <tr key={j}>
                                                                                    <td>
                                                                                        {i.DeviceNick}
                                                                                    </td>
                                                                                    <td>{moment(new Date(i.OfflineTime)).
                                                                                    format('YYYY-MM-DD HH:mm:ss')}</td>
                                                                                    <td>{i.OfflineTime ? moment(new Date(i.RecoveryTime)).
                                                                                    format('YYYY-MM-DD HH:mm:ss') :
                                                                                        <span style={{color:'#fd8888'}}>'还未恢复'</span>}</td>
                                                                                </tr>)
                                                                        })
                                                                    }
                                                                </Table.Body>
                                                            </Table>
                                                        </div>*/}
                                                        <div style={{height:'222px',marginTop:'0px',overflowY:'scroll'}} className="table-need-body">
                                                            <Table>
                                                                <thead>
                                                                <tr>
                                                                    <Table.Th className="large">设备名称</Table.Th>
                                                                    <Table.Th className="min">离线时间</Table.Th>
                                                                    <Table.Th className="min">恢复时间</Table.Th>

                                                                </tr>
                                                                </thead>
                                                                <Table.Body>
                                                                    {
                                                                        logData&&logData.map((i,j)=>{
                                                                            return(
                                                                                <tr key={j}>
                                                                                    <td>
                                                                                        {i.DeviceNick}
                                                                                    </td>
                                                                                    <td>{moment(i.OfflineTime.replace(/-/g,'/')).
                                                                                    format('YYYY-MM-DD HH:mm')}</td>
                                                                                    <td>{i.RecoveryTime ? moment(i.RecoveryTime.replace(/-/g,'/')).
                                                                                    format('YYYY-MM-DD HH:mm') :
                                                                                        <span style={{color:'#fd8888'}}>还未恢复</span>}</td>
                                                                                </tr>
                                                                            )
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
                                }
                            </div>:<div  className="charts useType"></div>
                        }

                    </div>
                </div>
            </div>
        )
    }
}

module.exports = AnalysisReport
