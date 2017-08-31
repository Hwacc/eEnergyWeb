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
import { getParentNode} from 'utils'
import {DateSelect,DateSelectState} from 'redux-components/dropdownselect/datepicker'
import RankButton from './rank-button'
import {Link} from 'react-router'
import $ from 'jquery'
export default class Rank extends BaseComponent {
    constructor(){
        super(...arguments);
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        let selectStates = new SelectState([
            ['community',{}],
            ['searchTimeType',{label:'',placeholder:'不限',allowEmpty:false,value:2, options:[{value:3,name:'按小时显示'},{value:2,name:'按日显示'},{value:1,name:'按月份显示'},{value:0,name:'按年度显示'}]}],
            ['group',{label:'分组',placeholder:'不限',allowEmpty:true},{type:'devicesType',label:'设备类型', options:[{value:1,name:'插座'},{value:2,name:'电表'}],allowEmpty:true,placeholder:'全部'}],
        ]);
        let dateStates = new DateSelectState([
            ['start',{value:moment(new Date(year,month,day)).add(-11,'day').toDate(),isMini:false,endWith:'day',isRight:false}],
            ['end',{value:moment(new Date(year,month,day)).add(-1,'second').toDate(),isMini:false,endWith:'day',isRight:true}]
        ]);
        dateStates.subMap(selectStates.getSelects());
        this.state={
            searchType:staticType.timeBaseOnEnum.month,
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
            treeDataClickLevel: 0,
            mode:1,

            selectArea:'全部区域',
            thHeight:0,
            updateFlag:false,
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

    /*获取区域管理列表*/
    getCommunityData(){
        let list  = this.props.list;
        let {selectStates} = this.state;
        if(list.length>0){
            let communityId = store.get('communityId');
            let val = communityId||(list[0]?list[0].value:null);
            val = !selectStates.getSelect('community').multiple? val:[{value:val}];
            this.getGroupData(val);
            this.areaSetSelectState('community',{
                options: list,
                isLoading: false,
                value:val,
            });
            this.setState({updateFlag:true});
        }else{
            this.setState({updateFlag:false});
        }
       /* console.log(this.props.list)
        this.communityRP&&this.communityRP.request.abort();
        this.communityRP = apis.group.getGroupListByCommunityID();
        this.registerRequest(this.communityRP.request);
        this.areaSetSelectState('community',{
            isLoading:true,
            isFailed:false
        });
        this.setState({
            isLoadingGroup:true,
            treeData:[],
        });
        this.communityRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                let list = getParentNode(data);
                let communityId = store.get('communityId');

            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.areaSetSelectState('community',{
                        isLoading:false,
                        isFailed:true
                    });
                }
            })*/
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
                let areaTypes={};
                data.map(i=>{
                    areaTypes[i.Id] = i.Name;
                });
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
                const treeData = dataTree.init({name:'全部区域',value:treeTop.Id,level:0});

                this.setState({
                    isLoadingGroup:false,
                    treeData:treeData,
                    areaTypes: areaTypes

                },()=>this.search(this.state.tokenId || this.state.currentGroupId))

            })
            .catch((err)=> {
            console.log(err)
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
        let gid;
        if(id){
            gid = id || this.state.currentGroupId;
        }else{
            gid = this.state.tokenId || this.state.currentGroupId;
        }
        let {treeData} = this.state;
        treeData&&treeData.map((t)=>{
          if(t.value == gid){
              this.setState({treeDataClickLevel: t.level});
              this.setState({selectArea:t.name});
          }
        });
        if(gid){
            this.getChildRank(gid);
        }else{
            alert('请选择区域！')
        }
    }




    getChildRank(c){
        let {selectStates,mode} = this.state;
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
        this.energyInfoRankRP = apis.energyInfo.getEnergyRank(mode,postData);
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

    componentDidMount(){
        this.setState({tokenId:this.props.location.query.id});
        this.getCommunityData();
    }

    componentDidUpdate(){
        if(this.props.list.length>0 && !this.state.updateFlag){
            this.setState({tokenId:this.props.location.query.id});
            this.getCommunityData();
        }
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
    //本地排序
    sortBy(){
        let { historyRankData, isLoadingChildRank, mode } = this.state
        let data = []
        switch(mode){
            case staticType.rankBaseOnEnum.totalUp:
                data = this.getBestNum('sortByMin',historyRankData,'TotalPower')
                break
            case staticType.rankBaseOnEnum.totalDown:
                data = this.getBestNum('sortByMax',historyRankData,'TotalPower')
                break
            case staticType.rankBaseOnEnum.onHourUp:
                data = this.getBestNum('sortByMin',historyRankData,'OnHour')
              
                break
            case staticType.rankBaseOnEnum.onHourDown:
                data = this.getBestNum('sortByMax',historyRankData,'OnHour')
                break
            case staticType.rankBaseOnEnum.hourAvePowerUp:
                data = this.getBestNum('sortByMin',historyRankData,'HourAvePower')
               
                break
            case staticType.rankBaseOnEnum.hourAvePowerDown:
                data = this.getBestNum('sortByMax',historyRankData,'HourAvePower')
                break
        }
        this.setState(
            {
                historyRankData:data,

            }
        )

    }
    render() {
        const {searchType,isLoadingHistoryData,isLoadingCompare,areaTypes,
            historyData,isLoadingGroup,currentGroupId,treeData,selectStates,mode
            ,historyRankData,totalData,childGroups,energyTendencyData,isLoadingChildRank,treeDataClickLevel,selectArea} = this.state;
        let  areaTitle =(areaTypes[currentGroupId] ==undefined?'全部区域':areaTypes[currentGroupId]) ;
        let areaFormTitle = areaTitle + '用能排行';
        let communityValue = selectStates.getSelect('community').value;
        let communityOptions = selectStates.getSelect('community').options;
        let communityName = '全部区域';
        communityOptions.length&&communityOptions.map(t=>{
            if(communityValue ==t.value){
                communityName = t.name;
            }
        })
        return (
            <div className="sem-has-middle-bar" onClick={()=>this.areaSetSelectState(null,{open:false})}>
                <SideCondition callback={()=>this.search()}>
                    <SideConditionChild  className="search" height="30%">
                        <div className="side-search">
                            <div className="search-title">查询条件</div>
                            <div className="search-child">
                                查询对象：
                                <MySelect onChange={(obj)=>this.areaSetSelectState('community',obj)}
                                          {...selectStates.getSelect('community')} getData={()=>this.getCommunityData()}
                                          style={{width:'61%'}}>
                                    {selectStates.getSelect('community').open&&
                                    <SelectList {...selectStates.getSelect('community')}
                                                onChange={(obj,cb)=>{this.areaSetSelectState('community',obj,cb);
                                                    obj.value&&this.getGroupData(obj.value);
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
                                {
                                    searchType === staticType.timeBaseOnEnum.multiYear &&
                                        <DateSelect {...selectStates.getSelect('start')}
                                                    style={{width: '33.8%',height:'36px'}}
                                                    placeholder="开始年份"
                                                    endWith="year"
                                                    onChange={(obj)=>{this.areaSetSelectState('start',obj);}}/>
                                }
                                {
                                    searchType === staticType.timeBaseOnEnum.year &&
                                        <DateSelect {...selectStates.getSelect('start')}
                                                    style={{width: '33.8%',height:'36px'}}
                                                    placeholder="选择起始月份"
                                                    endWith="month"
                                                    onChange={(obj)=>{this.areaSetSelectState('start',obj);}}/>
                                }
                                {
                                    searchType === staticType.timeBaseOnEnum.month &&
                                        <DateSelect {...selectStates.getSelect('start')}
                                                    style={{width: '33.8%',height:'36px'}}
                                                    placeholder="选择起始序号"
                                                    endWith="day"
                                                    onChange={(obj)=>{this.areaSetSelectState('start',obj);}}/>
                                }
                                {
                                    searchType === staticType.timeBaseOnEnum.day &&
                                        <DateSelect {...selectStates.getSelect('start')}
                                                    style={{width: '33.8%',height:'36px'}}
                                                    placeholder="选择序号"
                                                    endWith="day"
                                                    date={new Date(2017,2,20)}
                                                    onChange={(obj)=>{
                                                        let endObj = Object.assign({},obj);
                                                        if(obj.value){
                                                            endObj.value = moment(obj.value).add(1,'day').add(-1,'second').toDate()
                                                        }
                                                        this.areaSetSelectState(['start','end'],[obj,endObj]);}}/>
                                }
                                {searchType === staticType.timeBaseOnEnum.multiYear &&<span style={{margin:'0 3px'}}>至</span>}
                                {
                                    searchType === staticType.timeBaseOnEnum.multiYear &&
                                        <DateSelect {...selectStates.getSelect('end')}
                                                    style={{width: '33.8%',height:'36px'}}
                                                    placeholder="结束年份"
                                                    endWith="year"
                                                    onChange={(obj)=>{
                                                        if(obj.value){
                                                            obj.value = moment(obj.value).add(1,'year').add(-1,'second').toDate()
                                                        }
                                                        this.areaSetSelectState('end',obj);}
                                                    }/>
                                }
                                {searchType === staticType.timeBaseOnEnum.year &&<span style={{margin:'0 3px'}}>至</span>}
                                {
                                    searchType === staticType.timeBaseOnEnum.year &&
                                        <DateSelect {...selectStates.getSelect('end')}
                                                    style={{width: '33.8%',height:'36px'}}
                                                    placeholder="选择结束月份"
                                                    endWith="month"
                                                    onChange={(obj)=>{
                                                        if(obj.value){
                                                            obj.value = moment(obj.value).add(1,'month').add(-1,'second').toDate()
                                                        }
                                                        this.areaSetSelectState('end',obj);}}/>
                                }
                                {searchType === staticType.timeBaseOnEnum.month &&<span style={{margin:'0 3px'}}>至</span>}
                                {
                                    searchType === staticType.timeBaseOnEnum.month &&
                                        <DateSelect {...selectStates.getSelect('end')}
                                                    style={{width: '33.8%',height:'36px'}}
                                                    placeholder="选择起始序号"
                                                    endWith="day"
                                                    onChange={(obj)=>{
                                                        if(obj.value){
                                                            obj.value = moment(obj.value).add(1,'day').add(-1,'second').toDate()
                                                        }
                                                        this.areaSetSelectState('end',obj);}}/>
                                }

                            </div>
                            <div className="search-child">
                                选择区域：
                                <div style={{width:'44.7%'}}>
                                    <Link to={{pathname:'/location',query:{from:'rank',currentId:currentGroupId}}}>
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

                <div className="sem-main-content" onClick={()=>this.areaSetSelectState(null,{open:false})}>
                    <div className="table-wrapper">
                        <PanelTable text={areaFormTitle}
                                    align="center"
                                    isLoading={isLoadingChildRank}
                                    loadingText="正在获取数据"
                        >
                            {
                                !isLoadingChildRank&&
                                <div className="table-need-head"style={{height:'auto',width:'100%'}}>
                                            <Table>
                                                <thead>
                                                <tr>
                                                    <Table.Th className="text-left">排名</Table.Th>
                                                    <Table.Th className="large">空调名</Table.Th>
                                                    <Table.Th>房间名</Table.Th>
                                                    <Table.Th className="large-select">总用电量(kWh)
                                                        {<RankButton
                                                            mode={mode}
                                                            data={ [staticType.rankBaseOnEnum.totalUp,
                                                                staticType.rankBaseOnEnum.totalDown] }
                                                            onChange={mode => this.setState({ mode:mode },()=>this.sortBy())}
                                                        />
                                                        }
                                                    </Table.Th>
                                                    <Table.Th className="mid-select">开启时长
                                                        {<RankButton
                                                            mode={mode}
                                                            data={ [staticType.rankBaseOnEnum.onHourUp,
                                                                staticType.rankBaseOnEnum.onHourDown] }
                                                            onChange={mode => this.setState({ mode:mode },()=>this.sortBy())}
                                                        />
                                                        }</Table.Th>
                                                    <Table.Th className="max-select">日平均用电量(kWh)
                                                        {<RankButton
                                                            mode={mode}
                                                            data={ [staticType.rankBaseOnEnum.hourAvePowerUp,
                                                                staticType.rankBaseOnEnum.hourAvePowerDown] }
                                                            onChange={mode => this.setState({ mode:mode },()=>this.sortBy())}
                                                        />
                                                        }</Table.Th>
                                                    <Table.Th className="large">品牌型号</Table.Th>
                                                    <Table.Th>制冷量</Table.Th>
                                                    <Table.Th>输入功率(W)</Table.Th>
                                                    <Table.Th>制冷剂</Table.Th>
                                                </tr>
                                                </thead>
                                                <Table.Body>
                                                    {
                                                        historyRankData.map((d,i) =>
                                                        <tr key={d.DeviceId}>
                                                            <td>{i+1}</td>
                                                            <td>{d.DeviceNick}</td>
                                                            <td>{d.RoomName}</td>
                                                            <td>{d.TotalPower?d.TotalPower.toFixed(2):0}</td>
                                                            <td>{d.OnHour}</td>
                                                            <td>{d.HourAvePower?d.HourAvePower.toFixed(2):0}</td>
                                                            <td>{d.BrandModel}</td>
                                                            <td>{d.CoolCapacity}</td>
                                                            <td>{d.PowerRate}</td>
                                                            <td>{d.Refrigerant}</td>
                                                        </tr>

                                                        )
                                                    }
                                                </Table.Body>
                                            </Table>
                                       {/* <div className="table-need-body" style={{height:'805px',marginTop:-this.state.thHeight}}>
                                            <Table>
                                                <thead>
                                                <tr>
                                                    <th className="text-left">排名</th>
                                                    <th>空调名</th>
                                                    <th>房间名</th>
                                                    <th>总用电量(kWh)
                                                        {<RankButton
                                                            mode={mode}
                                                            data={ [staticType.rankBaseOnEnum.totalUp,
                                                                staticType.rankBaseOnEnum.totalDown] }
                                                            onChange={mode => this.setState({ mode:mode })}
                                                        />
                                                        }
                                                    </th>

                                                    <th>开启时长
                                                        {<RankButton
                                                            mode={mode}
                                                            data={ [staticType.rankBaseOnEnum.onHourUp,
                                                                staticType.rankBaseOnEnum.onHourDown] }
                                                            onChange={mode => this.setState({ mode:mode })}
                                                        />
                                                        }</th>
                                                    <th>日平均用电量(kWh)
                                                        {<RankButton
                                                            mode={mode}
                                                            data={ [staticType.rankBaseOnEnum.hourAvePowerUp,
                                                                staticType.rankBaseOnEnum.hourAvePowerDown] }
                                                            onChange={mode => this.setState({ mode:mode })}
                                                        />
                                                        }</th>
                                                    <th>品牌型号</th>
                                                    <th>制冷量</th>
                                                    <th>输入功率(W)</th>
                                                    <th>制冷剂</th>
                                                </tr>
                                                </thead>
                                                <Table.Body>
                                                    {
                                                        historyRankData.map((d,i) =>
                                                            <tr key={d.DeviceId}>
                                                                <td>{i+1}</td>
                                                                <td>{d.DeviceNick}</td>
                                                                <td>{d.RoomName}</td>
                                                                <td>{d.TotalPower?d.TotalPower.toFixed(2):0}</td>
                                                                <td>{d.OnHour}</td>
                                                                <td>{d.HourAvePower?d.HourAvePower.toFixed(2):0}</td>
                                                                <td>{d.BrandModel}</td>
                                                                <td>{d.CoolCapacity}</td>
                                                                <td>{d.PowerRate}</td>
                                                                <td>{d.Refrigerant}</td>
                                                            </tr>

                                                        )
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

module.exports = Rank;
