/**
 * 创建于：2016-6-8
 * 创建人：杨骐彰
 * 说明： 设备管理主页面
 */


import {Input} from 'redux-components/formcontrol'
import {TreeList, Tree} from 'redux-components/treeList'
import apis from 'apis'
import {
    MySelect, SelectList, SelectState
}
    from 'redux-components/dropdownselect'
import {SideCondition, SideConditionChild} from 'redux-components/side-condition'
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
import {DateSelect, DateSelectState} from 'redux-components/dropdownselect/datepicker'
import {Link} from 'react-router'
import $ from 'jquery'

export default class Area extends BaseComponent {
    constructor() {
        super(...arguments);
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        let selectStates = new SelectState([
            ['community', {}],
            ['searchTimeType', {
                label: '',
                placeholder: '不限',
                allowEmpty: false,
                value: 2,
                options: [{value: 3, name: '按小时显示'}, {value: 2, name: '按日显示'}, {value: 1, name: '按月份显示'}, {
                    value: 0,
                    name: '按年度显示'
                }]
            }],
            ['group', {label: '分组', placeholder: '不限', allowEmpty: true}, {
                type: 'devicesType',
                label: '设备类型',
                options: [{value: 1, name: '插座'}, {value: 2, name: '电表'}],
                allowEmpty: true,
                placeholder: '全部'
            }],
        ]);
        let dateStates = new DateSelectState([
            ['start', {
                value: moment(new Date(year, month, day)).add(-11, 'day').toDate(),
                isMini: false,
                endWith: 'day',
                isRight: false
            }],
            ['end', {
                value: moment(new Date(year, month, day)).add(-1, 'second').toDate(),
                isMini: false,
                endWith: 'day',
                isRight: true
            }]
        ]);
        dateStates.subMap(selectStates.getSelects());
        this.state = {
            searchType: staticType.timeBaseOnEnum.month,
            //分组名称
            groupName: '',
            //管理区域
            community: null,
            //是否正在查询

            //当前选中分组
            activeGroupInfo: null,

            //分组号
            group: null,
            //是否被全选
            isLoadedGroup: false,
            isFirst: true,
            //selects
            selectStates: dateStates,
            //treeData
            treeData: null,
            isLoadingGroup: false,
            currentGroupId: null,
            historyData: [],
            historyRankData: [],
            titles: [],
            isLoadingHistoryData: false,
            isLoadingChildRank: false,
            isLoadingMultiTotal: false,
            totalData: [],
            //compare
            isLoadingCompare: false,
            compareData: [],
            energyTendencyData: [],

            historyChildData: [],
            list: [],
            areaTypes: {},
            treeDataClickLevel: 0,
            selectArea:'全部区域',
            updateFlag:false,
        }
    }

    areaSetSelectState(type, obj, cb) {
        let {selectStates} = this.state;
        if (type) {
            if (Array.isArray(type)) {
                selectStates.editSomeSelect(type, obj)
            } else {
                selectStates.editSelect(type, obj);
            }
        } else {
            selectStates.editAllSelect(obj)
        }
        this.setState({
            selectStates: selectStates
        }, cb && cb())
    }

    /*获取区域管理列表*/
    getCommunityData(index) {
        let list = this.props.list;
        let {selectStates} = this.state;
        if (list.length > 0) {
            let val;
            if(index){
                val = index;
            }else{
                let communityId = store.get('communityId');
                val = communityId || (list[0] ? list[0].value : null);
                val = !selectStates.getSelect('community').multiple ? val : [{value: val}];
            }
            this.getGroupData(val);
            this.areaSetSelectState('community', {
                options: list,
                isLoading: false,
                value: val,
            });
            this.setState({updateFlag:true});
        }else{
            this.setState({updateFlag:false});
        }
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
        let level2Num = 0;
        let level2Id = id;
        this.groupRP.promise
            .then((res) => {
                if (!this.mounted)return;
                let data = res.Data || [];
                this.setState({list: data});
                let list = data.map((c) => {
                    let catalog = c.Path.split('/');
                    catalog.pop();
                    catalog.shift();
                    catalog.push(c.Id)
                    catalog = catalog.join('|');
                    if(c.Level === 2){
                        level2Num++;
                    }
                    if(level2Num === 1){
                        level2Id = c.Id;
                    }else {
                        level2Id = id;
                    }
                    return {
                        name: c.Name,
                        value: c.Id,
                        catalog: catalog,
                        level: c.Level
                    }

                });
                let areaTypes = {};
                data.map(i => {
                    areaTypes[i.Id] = i.Name;
                });
                const dataTree = new Tree(list);
                const treeData = dataTree.init({name: '全部区域', value: id, level: 0});
                this.setState({
                    isLoadingGroup: false,
                    treeData: treeData,
                    areaTypes: areaTypes

                }, () => this.search(this.state.tokenId || level2Id))

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

    handleTreeList(item) {
        let data = this.state.treeData;
        data = Tree.setShow(item, data);
        this.setState({treeData: data})
    }

    //查询
    search(id) {
        let gid;
        if(id){
            gid = id || this.state.currentGroupId;
        }else{
            gid = this.state.tokenId || this.state.currentGroupId;
        }
        let {treeData} = this.state;
        treeData && treeData.map((t) => {
            if (t.value == gid) {
                this.setState({currentGroupId:t.value});
                this.setState({treeDataClickLevel: t.level});
                this.setState({selectArea:t.name});
            }
        });
        if (gid) {
            this.getGroupDetail(gid);
            this.getChildRank(gid);
            this.getMultiTotal(gid);
            this.getCompareData(gid);
        } else {
            alert('请选择区域！')
        }
    }

    getGroupDetail(c) {
        let {selectStates, treeData, searchType} = this.state;
        let postDataDetail = {
            GroupId: c,
            Form: searchType,
            StartTime: moment(selectStates.getSelect('start').value).format(),
            EndTime: moment(selectStates.getSelect('end').value).format()

        };
        let group = {};
        treeData && treeData.some(i => {
            if (i.value == c) {
                group = i
            }

            return i.value == c;
        });
        let childGroups = [];
        treeData && treeData.map(i => {
            if(group.level  == 0){
                if (i.level == 3) {
                        childGroups.push(i)
                }
            }else{
                if (i.level == group.level + 1) {
                    if (i.catalogArray[i.level - 1] == group.value) {
                        childGroups.push(i)
                    }

                }
            }
        });

        this.energyInfoRP && this.energyInfoRP.request.abort();
        this.setState({
            isLoadingHistoryData: true,
            historyData: [],
            childGroups: childGroups
        });
        let baseObj = {};
        childGroups.map(g => {
            baseObj[g.name] = 0
        });
        this.energyInfoRP = apis.energyInfo.getGroupDetail(postDataDetail);
        this.registerRequest(this.energyInfoRP.request);
        this.energyInfoRP.promise
            .then((res) => {
                if (!this.mounted)return;
                let list = [];
                let start = moment(selectStates.getSelect('start').value).format('YYYY-MM-DD HH:mm:ss');
                let end = moment(selectStates.getSelect('end').value).add(1, 'second').format('YYYY-MM-DD HH:mm:ss');
                if (selectStates.getSelect('start').value <= selectStates.getSelect('end').value) {
                    while (start != end) {
                        let baseObj = {
                            StatisticTime: start,
                        };
                        let obj = {
                            TotalEle: 0
                        };
                        childGroups.map(g => {
                            obj[g.name] = 0
                        });
                        res.Data && res.Data.some(i => {
                            if (i.StatisticTime == start) {
                                if (i.ChildGroups) {
                                    i.ChildGroups.map(item => {
                                        obj[item.GroupName] = item.TotalEle
                                    })
                                }
                                obj = Object.assign({}, obj, i)
                            }
                            return i.StatisticTime == start
                        });
                        if (searchType == staticType.timeBaseOnEnum.multiYear) {

                            list.push(Object.assign({}, obj, baseObj));
                            start = moment(start).add(1, 'year').format('YYYY-MM-DD HH:mm:ss');
                        } else if (searchType == staticType.timeBaseOnEnum.year) {

                            list.push(Object.assign({}, obj, baseObj));
                            start = moment(start).add(1, 'month').format('YYYY-MM-DD HH:mm:ss');
                        } else if (searchType == staticType.timeBaseOnEnum.month) {
                            list.push(Object.assign({}, obj, baseObj));
                            start = moment(start).add(1, 'day').format('YYYY-MM-DD HH:mm:ss');
                        } else {
                            list.push(Object.assign({}, obj, baseObj));
                            start = moment(start).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
                        }
                    }
                } else {
                    alert('请选择正确的开始结束时间！')
                }
                ;
                list && list.map(i => {
                    if (searchType == staticType.timeBaseOnEnum.multiYear) {
                        i.formTime = moment(i.StatisticTime).format('YYYY年');
                    } else if (searchType == staticType.timeBaseOnEnum.year) {
                        i.formTime = moment(i.StatisticTime).format('YYYY年M月');
                    } else if (searchType == staticType.timeBaseOnEnum.month) {
                        i.formTime = moment(i.StatisticTime).format('YYYY年M月D日');
                    } else {
                        i.formTime = moment(i.StatisticTime).format('YYYY年M月D日 H时');
                    }
                });
                this.setState({
                    isLoadingHistoryData: false,
                    historyData: list
                });
            })
            .catch((err) => {
                if (!err.abort) {
                    this.setState({
                        isLoadingHistoryData: false
                    });
                    alert(err.msg);
                }
            });
    }


    getChildRank(c) {
        let {selectStates, treeData} = this.state;
        this.setState({
            isLoadingChildRank: true,
            historyRankData: []

        });
        let postData = {
            Form: selectStates.getSelect('searchTimeType').value,
            GroupId: c,
            StartTime: moment(selectStates.getSelect('start').value).format('YYYY-MM-DD HH:mm:ss'),
            EndTime: moment(selectStates.getSelect('end').value).format('YYYY-MM-DD HH:mm:ss')

        };
        this.energyInfoRankRP && this.energyInfoRankRP.request.abort();
        this.energyInfoRankRP = apis.energyInfo.getChildRank(postData);
        this.registerRequest(this.energyInfoRankRP.request);
        this.energyInfoRankRP.promise
            .then((res) => {
                if (!this.mounted)return;
                this.setState({
                    isLoadingChildRank: false,
                    historyRankData: res.Data || []
                });

            })
            .catch((err) => {
                if (!err.abort) {
                    this.setState({
                        isLoadingChildRank: false
                    });
                    alert(err.msg);
                }
            });
    }

    getMultiTotal(c) {
        let {selectStates} = this.state;
        let postMulData = {
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
            .then((res) => {
                if (!this.mounted)return;
                let group = res.Data.map((t) => {
                    return t.GroupName;
                });
                this.getGroupDetail(c, group);
                this.setState({
                    isLoadingMultiTotal: true,
                    totalData: res.Data || []
                });

            })
            .catch((err) => {
                if (!err.abort) {
                    this.setState({
                        isLoadingMultiTotal: false
                    });
                    alert(err.msg);
                }
            });
    }


    //获取比较统计
    getCompareData(c) {
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
                GroupId: c,
                TimeRanges: [{
                    StartTime: moment(compareDaySearchTimeParams[0]).format(),
                    EndTime: moment(compareDaySearchTimeParams[1]).format()
                },
                    {
                        StartTime: moment(compareToDaySearchTimeParams[0]).format(),
                        EndTime: moment(compareToDaySearchTimeParams[1]).format()
                    },
                    {
                        StartTime: moment(compareMonthSearchTimeParams[0]).format(),
                        EndTime: moment(compareMonthSearchTimeParams[1]).format()
                    },
                    {
                        StartTime: moment(compareToMonthSearchTimeParams[0]).format(),
                        EndTime: moment(compareToMonthSearchTimeParams[1]).format()
                    }]
            }
        );
        this.setState({isLoadingCompare: true});

        this.registerRequest(this.energyInfoCompareRP.request);
        this.energyInfoCompareRP.promise.then((res) => {
            if (!this.mounted)return;
            this.setState({
                compareData: res.Data,
                isLoadingCompare: false
            });

            let {compareData} = this.state;
            this.setState({energyTendencyData: []});
            let dayIsAdd = 0;
            let monthIsAdd = 0;
            if (compareData[1] == 0 && compareData[3] == 0) {

            } else if (compareData[1] == 0) {
                dayIsAdd = 0;
                monthIsAdd = ((compareData[2] - compareData[3]) / compareData[3] * 100).toFixed(2);
            } else if (compareData[3] == 0) {
                dayIsAdd = ((compareData[0] - compareData[1]) / compareData[1] * 100).toFixed(2);
                monthIsAdd = 0;
            } else {
                dayIsAdd = ((compareData[0] - compareData[1]) / compareData[1] * 100).toFixed(2);
                monthIsAdd = ((compareData[2] - compareData[3]) / compareData[3] * 100).toFixed(2);
            }
            let dayAdd = false;
            let monthAdd = false;
            if (dayIsAdd >= 0) {
                dayAdd = true;
            }
            if (monthIsAdd >= 0) {
                monthAdd = true;
            }
            this.setState({
                energyTendencyData: [[{
                    num: compareData[0] ? (compareData[0]).toFixed(2) : 0,
                    isAdd: dayAdd,
                    changeNum: dayIsAdd + '%',
                    name: '本日用电量'
                },
                    {
                        num: compareData[2] ? (compareData[2]).toFixed(2) : 0,
                        isAdd: monthAdd,
                        changeNum: monthIsAdd + '%',
                        name: '本月用电量'
                    }],
                    [{
                        num: compareData[1] ? (compareData[1]).toFixed(2) : 0,
                        name: '昨日同期'
                    },
                        {
                            num: compareData[3] ? (compareData[3]).toFixed(2) : 0,
                            name: '上月同期'
                        }]]
            })

        }).catch((err) => {
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
        let day = now.getDate() - 1;
        //按年查询
        if (type === 0) {
            this.setState({
                searchType: staticType.timeBaseOnEnum.multiYear
            });
            this.areaSetSelectState(['start', 'end'],
                [
                    {value: moment(new Date(year, 0, 1)).add(-2, 'year').toDate()},
                    {value: moment(new Date(year, 0, 1)).add(1, 'year').add(-1, 'second').toDate()}
                ]);
        }
        else if (type === 1) {
            this.setState({
                searchType: staticType.timeBaseOnEnum.year
            });
            this.areaSetSelectState(['start', 'end'],
                [
                    {value: moment(new Date(year, month, 1)).add(-11, 'month').toDate()},
                    {value: moment(new Date(year, month, 1)).add(1, 'month').add(-1, 'second').toDate()}
                ]);
        }
        //按月查询
        else if (type === 2) {
            this.setState({
                searchType: staticType.timeBaseOnEnum.month
            });
            this.areaSetSelectState(['start', 'end'],
                [
                    {value: moment(new Date(year, month, day)).add(-9, 'day').toDate()},
                    {value: moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()}
                ]);
        }
        else {
            this.setState({
                searchType: staticType.timeBaseOnEnum.day
            });
            this.areaSetSelectState(['start', 'end'],
                [
                    {value: new Date(year, month, day)},
                    {value: moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()}
                ]);
        }
    }

    chartsClick(e) {
        let {treeData}= this.state;
        treeData && treeData.map(t => {
            if (e === t.name) {
                this.setState({currentGroupId: t.value})
            }
        });
        this.search(this.state.currentGroupId);
    }

    componentDidMount() {
        this.setState({tokenId:this.props.location.query.id});
        this.getCommunityData();
    }

/*    componentWillReceiveProps(){
        console.log('area will reciveProps');
        console.log(this.props.list.length>0? 'props list not empty':'props list is empty');
        console.log(this.state.list.length>0? 'list not empty':'list is empty');
    }*/

    componentDidUpdate(){
        if(this.props.list.length>0 && !this.state.updateFlag){
            this.setState({tokenId:this.props.location.query.id});
            this.getCommunityData();
        }
    }

    render() {
        const {
            searchType, isLoadingHistoryData, isLoadingCompare, areaTypes,
            historyData, isLoadingGroup, currentGroupId, treeData, selectStates
            , historyRankData, totalData, childGroups, energyTendencyData, isLoadingChildRank, treeDataClickLevel,selectArea
        } = this.state;
        let areaTitle = (areaTypes[currentGroupId] == undefined ? '全部区域' : areaTypes[currentGroupId]);
        let areaFormTitle = areaTitle + '用能明细';
        let communityValue = selectStates.getSelect('community').value;
        let communityOptions = selectStates.getSelect('community').options;
        let communityName = '全部区域';
        communityOptions.length && communityOptions.map(t => {
            if (communityValue == t.value) {
                communityName = t.name;
            }
        })
        return (
            <div className="sem-has-middle-bar" onClick={() => this.areaSetSelectState(null, {open: false})}>
                <SideCondition callback={() => this.search()}>
                    <SideConditionChild className="search" style={{height: '30%'}}>
                        <div className="side-search">
                            <div className="search-title">查询条件</div>
                            <div className="search-child">
                                查询对象：
                                <MySelect onChange={(obj) => this.areaSetSelectState('community', obj)}
                                          {...selectStates.getSelect('community')}
                                          getData={() => this.getCommunityData()}
                                          style={{width: '61%'}}>
                                    {selectStates.getSelect('community').open &&
                                    <SelectList {...selectStates.getSelect('community')}
                                                onChange={(obj, cb) => {
                                                    this.areaSetSelectState('community', obj, cb);
                                                    obj.value && store.set('communityId',obj.value);
                                                    obj.name && store.set('communityName',obj.name);
                                                    obj.value && this.setState({tokenId:obj.value});
                                                    obj.value && this.getGroupData(obj.value);
                                                }}
                                    />}
                                </MySelect>
                            </div>
                            <div className="search-child">
                                起始时间：
                                {searchType === staticType.timeBaseOnEnum.multiYear &&
                                    <DateSelect style={{width: '33.8%',height:'36px'}}
                                                {...selectStates.getSelect('start')}
                                                placeholder="开始年份"
                                                endWith="year"
                                                onChange={(obj) => {
                                                    this.areaSetSelectState('start', obj);
                                                }}
                                                handleClick={() => {
                                                    alert('onclick');
                                                }}/>
                                }
                                {searchType === staticType.timeBaseOnEnum.year &&
                                    <DateSelect style={{width: '33.8%',height:'36px'}}
                                                {...selectStates.getSelect('start')}
                                                placeholder="选择起始月份"
                                                endWith="month"
                                                onChange={(obj) => {
                                                    this.areaSetSelectState('start', obj);
                                                }}/>

                                }
                                {searchType === staticType.timeBaseOnEnum.month &&
                                    <DateSelect style={{width: '33.8%',height:'36px'}}
                                                {...selectStates.getSelect('start')}
                                                placeholder="选择起始日期"
                                                endWith="day"
                                                onChange={(obj) => {
                                                    this.areaSetSelectState('start', obj);
                                                }}/>
                                }
                                {searchType === staticType.timeBaseOnEnum.day &&
                                    <DateSelect style={{width: '33.8%',height:'36px'}}
                                                {...selectStates.getSelect('start')}
                                                placeholder="选择日期"
                                                endWith="day"
                                                onChange={(obj) => {
                                                    let endObj = Object.assign({}, obj);
                                                    if (obj.value) {
                                                        endObj.value = moment(obj.value).add(1, 'day').add(-1, 'second').toDate()
                                                    }
                                                    this.areaSetSelectState(['start', 'end'], [obj, endObj]);
                                                }}/>
                                }
                                {searchType === staticType.timeBaseOnEnum.multiYear &&<span style={{margin:'0 3px'}}>至</span>}
                                {searchType === staticType.timeBaseOnEnum.multiYear &&
                                    <DateSelect style={{width: '33.8%',height:'36px'}}
                                                {...selectStates.getSelect('end')}
                                                placeholder="结束年份"
                                                endWith="year"
                                                onChange={(obj) => {
                                                    if (obj.value) {
                                                        obj.value = moment(obj.value).add(1, 'year').add(-1, 'second').toDate()
                                                    }
                                                    this.areaSetSelectState('end', obj);
                                                }
                                                }/>
                                }
                                {searchType === staticType.timeBaseOnEnum.year &&<span style={{margin:'0 3px'}}>至</span>}
                                {searchType === staticType.timeBaseOnEnum.year &&
                                    <DateSelect style={{width: '33.8%',height:'36px'}}
                                                {...selectStates.getSelect('end')}
                                                placeholder="选择结束月份"
                                                endWith="month"
                                                onChange={(obj) => {
                                                    if (obj.value) {
                                                        obj.value = moment(obj.value).add(1, 'month').add(-1, 'second').toDate()
                                                    }
                                                    this.areaSetSelectState('end', obj);
                                                }}/>
                                }

                                {searchType === staticType.timeBaseOnEnum.month &&<span style={{margin:'0 3px'}}>至</span>}
                                {searchType === staticType.timeBaseOnEnum.month &&
                                    <DateSelect style={{width: '33.8%',height:'36px'}}
                                                {...selectStates.getSelect('end')}
                                                placeholder="选择起始日期"
                                                endWith="day"
                                                onChange={(obj) => {
                                                    if (obj.value) {
                                                        obj.value = moment(obj.value).add(1, 'day').add(-1, 'second').toDate()
                                                    }
                                                    this.areaSetSelectState('end', obj);
                                                }}/>
                                }
                            </div>
                            <div className="search-child">
                                报表类型：
                                <MySelect onChange={(obj) => {
                                                this.areaSetSelectState('searchTimeType', obj);
                                            }}
                                          {...selectStates.getSelect('searchTimeType')}
                                          style={{width: '44.7%'}}>
                                    {selectStates.getSelect('searchTimeType').open &&
                                    <SelectList {...selectStates.getSelect('searchTimeType')}
                                                onChange={(obj, cb) => {
                                                    this.areaSetSelectState('searchTimeType', obj, cb);
                                                    this.handleSearchTypeChange(obj)
                                                }}
                                    />}
                                </MySelect>
                            </div>
                            <div className="search-child">
                                选择区域：
                                <div style={{width:'44.7%'}}>
                                    <Link to={{pathname:'/location',query:{from:'area',currentId:currentGroupId,currentName:this.state.tokenName}}}>
                                        <div className="select-area"><div className="area-text" style={{marginLeft:'17px'}}>{selectArea}</div><span className="icon"/></div>
                                    </Link>
                                </div>
                            </div>
                            <div className="search-child" style={{display:'block'}}>
                                <Button className="search-button" onClick={this.search.bind(this)}>查询</Button>
                            </div>
                        </div>
                    </SideConditionChild>
                </SideCondition>

                <div className="sem-main-content" onClick={() => this.areaSetSelectState(null, {open: false})}>
                    {
                        (treeDataClickLevel == 0 || treeDataClickLevel == 2)&&
                        <div className="charts-wrapper">
                            <div className="all-area-charts">
                                <div className="charts-total">总用电量：{totalData[0] ? (totalData[0]).toFixed(2) : 0}</div>
                                { isLoadingChildRank ? <PreLoader />
                                    : (historyRankData.length ? <AllAreaCharts data={historyRankData}
                                                                               name={communityName}
                                                                               searchType={searchType}
                                                                               startTime={selectStates.getSelect('start').value}
                                                                               endTime={selectStates.getSelect('end').value}
                                                                               chartsClick={(e) => this.chartsClick(e)}/> :
                                        <div style={{
                                            backgroundImage: `url(${icons.noArea})`,
                                            width: 190,
                                            height: 156,
                                            position: 'relative',
                                            top: '50%',
                                            left: '50%',
                                            marginLeft: -95,
                                            marginTop: -78
                                        }}>
                                        </div>
                                )
                                }
                            </div>
                        </div>
                    }
                    {
                        !(treeDataClickLevel == 0 || treeDataClickLevel == 2) &&
                        <div className="charts-total-wrapper" style={{height: '262.5px', margin: '11px 0'}}>
                            <div className="charts-total">总用电量：{totalData[0] ? (totalData[0]).toFixed(2) : 0}</div>
                            {
                                isLoadingHistoryData ? <PreLoader />
                                    : <TotalCharts data={historyData} title={areaTitle} searchType={searchType}

                                />
                            }
                        </div>
                    }
                    {
                        !(treeDataClickLevel == 0 || treeDataClickLevel == 2)&&
                            <div className="pie-wrapper">
                                <div className="pie">

                                    <span className="header-right">kWh</span>
                                    {
                                        isLoadingChildRank ? <PreLoader />
                                            : (historyRankData.length ?
                                                <AreaCharts data={historyRankData} title={areaTitle}/> :
                                                <div style={{
                                                    backgroundImage: `url(${icons.noArea})`,
                                                    width: 190,
                                                    height: 156,
                                                    position: 'relative',
                                                    top: '50%',
                                                    left: '50%',
                                                    marginLeft: -95,
                                                    marginTop: -78
                                                }}>
                                                </div>
                                        )
                                    }

                                </div>

                                <div className="word">
                                    {
                                        isLoadingCompare ? <PreLoader />
                                            : <Statistics title="用能环比-总"
                                                          foots="kWh"
                                                          data={energyTendencyData}/>
                                    }
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
                                !isLoadingHistoryData && <div>
                                    <div style={{height:'auto',width:'100%'}} className="table-need-head">
                                        <Table>
                                            <thead>
                                            <tr>
                                                <Table.Th className="large">日期</Table.Th>
                                                <Table.Th className="min">总用电量</Table.Th>
                                                {
                                                    !(treeDataClickLevel == 0)&&childGroups && childGroups.map((t, i) => {
                                                        return (
                                                            <Table.Th className="min" key={i}>{t.name}</Table.Th>
                                                        )
                                                    })
                                                }

                                            </tr>
                                            </thead>
                                            <Table.Body>
                                                {
                                                    historyData && historyData.map((i, j) => {
                                                        return (
                                                            <tr key={j}>
                                                                <td>
                                                                    {i.formTime}
                                                                </td>
                                                                <td>
                                                                    {i.TotalEle ? i.TotalEle.toFixed(2) : 0}
                                                                </td>
                                                                {
                                                                    !(treeDataClickLevel == 0)&& childGroups && childGroups.map((g, n) => {
                                                                        return (
                                                                            <td key={n}>{i[g.name] ? i[g.name].toFixed(2) : 0}</td>
                                                                        )
                                                                    })
                                                                }
                                                            </tr>)
                                                    })
                                                }
                                            </Table.Body>
                                        </Table>
                                    </div>
                                   {/* <div style={{height: '250px'}} className="table-need-body">
                                        <Table>
                                            <thead>
                                            <tr>
                                                <Table.Th className="large">日期</Table.Th>
                                                <Table.Th className="min">总用电量</Table.Th>
                                                {
                                                    childGroups && childGroups.map((t, i) => {
                                                        return (
                                                            <Table.Th className="min" key={i}>{t.name}</Table.Th>
                                                        )
                                                    })
                                                }

                                            </tr>
                                            </thead>
                                            <Table.Body>
                                                {
                                                    historyData && historyData.map((i, j) => {
                                                        return <tr key={j}>
                                                            <td>
                                                                {i.formTime}
                                                            </td>
                                                            <td>
                                                                {i.TotalEle ? i.TotalEle.toFixed(2) : 0}
                                                            </td>
                                                            {
                                                                childGroups && childGroups.map((g, k) => {
                                                                    return (
                                                                        <td key={k}>{i[g.name] ? i[g.name].toFixed(2) : 0}</td>
                                                                    )
                                                                })
                                                            }
                                                        </tr>
                                                    })
                                                }
                                            </Table.Body>
                                        </Table>
                                    </div>*/}
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

module.exports = Area;
