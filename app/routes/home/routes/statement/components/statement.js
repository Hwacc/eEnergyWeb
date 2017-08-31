/**
 * Created by whj57 on 2016/11/16.
 */
/**
 * 创建于：2016-5-12
 * 创建人：杨骐彰
 * 说明： 当前用电统计页面
 */
import {Input} from 'redux-components/formcontrol'
import {TreeList,Tree} from 'redux-components/treeList'
import apis from 'apis'
import icons from 'icons'
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
import {getParentNode} from 'utils'
import config from 'config'
import {DateSelect,DateSelectState} from 'redux-components/dropdownselect/datepicker'


export default class Statement extends BaseComponent {
    constructor(){
        super(...arguments);
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate()-1;

        let selectStates = new SelectState([
            ['community',{}],
            ['searchTimeType', {label:'', placeholder:'不限',allowEmpty:false,value:2, options:[{value:3,name:'按小时显示'},{value:2,name:'按日显示'}, {value:1,name:'按月份显示'},{value:0,name:'按年度显示'}]}]
        ]);
        let dateStates = new DateSelectState([
            ['start',{value:moment(new Date(year,month,day)).add(-10,'day').toDate(),isMini:false,endWith:'day',isRight:false}],
            ['end',{value:moment(new Date(year,month,day)).add(1,'day').add(-1,'second').toDate(),isMini:false,endWith:'day',isRight:true}]
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
            isLoadedGroup: false,
            isFirst: true,
            //selects
            selectStates:dateStates,
            //treeData
            treeData: null,
            isLoadingGroup:false,
            currentGroupId:null,
            historyData:[],
            titles:[],
            isLoadingHistoryData: false,
            typeList:[],
            isDownLoad:false,
            time:'',
            showData:[]

        }
    }

    reportSetSelectState(type,obj,cb) {
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
            this.getGroupData(val);
            this.reportSetSelectState('community',{
                options: list,
                isLoading: false,
                value:val,
            });
        }
    }
       /* let {selectStates} = this.state;
        this.communityRP = apis.group.getGroupListByCommunityID();
        this.registerRequest(this.communityRP.request);
        this.reportSetSelectState('community',{
            isLoading:true,
            isFailed:false
        });
        this.communityRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let data = res.Data || [];
                let list = getParentNode(data);
                let communityId = store.get('communityId');
                let val = communityId||(list[0]?list[0].value:null);
                val = !selectStates.getSelect('community').multiple? val:[{value:val}];
                this.getGroupData(val);
                this.reportSetSelectState('community',{
                    options: list,
                    isLoading: false,
                    value:val,
                });

            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.reportSetSelectState('community',{
                        isLoading:false,
                        isFailed:true
                    });
                }
            })
    }*/

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
        const {selectStates,currentGroupId} = this.state;
        if(selectStates.getSelect('start').value>=selectStates.getSelect('end').value){
            alert('请选择正确的开始结束时间！')
        }
        let searchType = selectStates.getSelect('searchTimeType').value;
        this.energyInfoRP && this.energyInfoRP.request.abort();
        this.setState({
            isLoadingHistoryData: true,
            historyData: []
        });
        let postData={
            GroupId:id|| currentGroupId,
            Form: searchType,
            StartTime: moment(selectStates.getSelect('start').value).format(),
            EndTime: moment(selectStates.getSelect('end').value).format()
        };

        this.energyInfoRP = apis.energyInfo.getReportForm(postData);
        this.registerRequest(this.energyInfoRP.request);
        this.energyInfoRP.promise
            .then((res)=> {
                if(!this.mounted)return;

                this.setState({
                    isLoadingHistoryData: false,
                });
                this.handleData(res.Data||[]);
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
    handleData(data){
        const {searchType,selectStates} = this.state;
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        let obj = {
                titles: [],
                StaticTime: [],
                data: []
            };
        if(searchType === staticType.timeBaseOnEnum.multiYear){
            for(let i=0;;i++){
                let midVal = moment(new Date(selectStates.getSelect('start').value)).add(i,'year').toDate();
                if(midVal<=selectStates.getSelect('end').value){
                    obj.StaticTime.push(midVal);
                    obj.titles.push(moment(midVal).format('YYYY年'))
                }else{
                    break;
                }
            }
        }else if(searchType === staticType.timeBaseOnEnum.year){
            if(selectStates.getSelect('start').value<selectStates.getSelect('end').value){
                for(let i=0;;i++){
                    let nowMonth = moment(new Date(selectStates.getSelect('start').value)).add(i,'month').toDate();
                    if(nowMonth<=selectStates.getSelect('end').value){
                        obj.StaticTime.push(nowMonth);
                        obj.titles.push(moment(nowMonth).format('YYYY年MM月'))
                    }else{
                        break;
                    }
                }
            }
        }else if(searchType === staticType.timeBaseOnEnum.month){
            if(selectStates.getSelect('start').value<selectStates.getSelect('end').value){
                for(let i=0;;i++){
                    let nowDay = moment(new Date(selectStates.getSelect('start').value)).add(i,'day').toDate();
                    if(nowDay<=selectStates.getSelect('end').value){
                        obj.StaticTime.push(nowDay);
                        obj.titles.push(moment(nowDay).format('MM月DD日'))

                    }else{
                        break;
                    }
                }
            }
        }else{
            let nowDay = moment(new Date(year, month, day)).toDate();
            if(selectStates.getSelect('start').value<nowDay){
                let hourNum = (moment(new Date(selectStates.getSelect('start').value)).add(1, 'day').add(-1, 'second').toDate()).getHours();
                for(let i=0;i<=hourNum;i++){
                    let midVal  = moment(new Date(selectStates.getSelect('start').value)).add(i,'hour').toDate();
                    obj.StaticTime.push(midVal);
                    obj.titles.push(moment(midVal).format('HH时'));
                }
            }else{
                let hour = now.getHours();
                for(let i=0;i<=hour;i++){
                    let midVal  = moment(new Date(selectStates.getSelect('start').value)).add(i,'hour').toDate();
                    obj.StaticTime.push(midVal);
                    obj.titles.push(moment(midVal).format('HH时'));
                }
            }
        }

        //表头时间处理
        if(searchType == staticType.timeBaseOnEnum.multiYear){
            this.setState({time: moment(selectStates.getSelect('start').value).format('YYYY年')+'-'+moment(selectStates.getSelect('end').value).format('YYYY年')});
        }else if(searchType == staticType.timeBaseOnEnum.year){
            this.setState({time: moment(selectStates.getSelect('start').value).format('YYYY年MM月')+'-'+moment(selectStates.getSelect('end').value).format('YYYY年MM月')});
        }else if(searchType == staticType.timeBaseOnEnum.month){
            this.setState({time: moment(selectStates.getSelect('start').value).format('YYYY年MM月DD日')+'-'+moment(selectStates.getSelect('end').value).format('YYYY年MM月DD日')});
        }else{
            this.setState({time:moment(selectStates.getSelect('start').value).format('YYYY年MM月DD日')});
        }
        //行数据处理
        obj.data = data&&data.map((t)=> {
                let rowData = [];
                rowData.push(t.DeviceNick)
                let val = t.TimeEleMaps;
                let total = 0
                obj.StaticTime.map((m)=>{
                    let searchIndex = 0;
                    if(val.some((j)=>{searchIndex++;return (moment(j.StatisticTime).format())==moment(m).format()})){
                        rowData.push(val[searchIndex-1].TotalEle?val[searchIndex-1].TotalEle.toFixed(2):0)
                        val[searchIndex-1].TotalEle&&(total += val[searchIndex-1].TotalEle*1)
                    }else {
                        rowData.push(0)
                    }

                });
                rowData.push(total.toFixed(2))
                return rowData;
            });
        let totalArray = []
        if(obj.data.length>0){
            for(let col = 1;col<obj.data[0].length;col++){
                let temp = 0
                for(let row =0 ; row< obj.data.length;row++){
                    temp += obj.data[row][col]*1
                }
                totalArray.push(temp.toFixed(2))
            }
        }
       this.setState({showData: obj,totalArray:totalArray})
    }


    /**
     * 下载
     */
    downLoad(){
        const {selectStates,currentGroupId} = this.state;
        let searchType = selectStates.getSelect('searchTimeType').value;
        this.formInfoRP && this.formInfoRP.request.abort();
        let postData={
            GroupId: currentGroupId,
            Form: searchType,
            StartTime: moment(selectStates.getSelect('start').value).format(),
            EndTime: moment(selectStates.getSelect('end').value).format()
        };
        this.formInfoRP = apis.excel.reportForm(postData);
        this.registerRequest(this.formInfoRP.request);
        this.setState({
            isDownLoad:false
        });
        this.formInfoRP.promise
            .then((res)=> {
                if(!this.mounted)return;
                let id = res.Data;
                this.setState({
                    downLoadSrc:config.apiHost+`/ReportFormExcel?id=${id}`,
                    isDownLoad:true
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

    /**
     * 查询类型条件变化
     * @param type
     */
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
            this.reportSetSelectState(['start','end'],
                [
                    {value:moment(new Date(year, 0, 1)).add(-2, 'year').toDate()},
                    {value:moment(new Date(year, 0, 1)).add(1, 'year').add(-1, 'second').toDate()}
                ]);
        }
        else if (type === 1) {
            this.setState({
                searchType: staticType.timeBaseOnEnum.year
            });
            this.reportSetSelectState(['start','end'],
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
            this.reportSetSelectState(['start','end'],
                [
                    {value:moment(new Date(year, month, day)).add(-9, 'day').toDate()},
                    {value:moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()}
                ]);
        }
        else {
            this.setState({
                searchType: staticType.timeBaseOnEnum.day
            });
            this.reportSetSelectState(['start','end'],
                [
                    {value:new Date(year, month, day)},
                    {value: moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()}
                ]);
        }
    }

    componentDidMount(){
        this.getCommunityData();
    }

    render() {
        const {searchType,isLoadingHistoryData,isDownLoad,
            isLoadingGroup,treeData,community,currentGroupId,totalArray,
            selectStates,downLoadSrc,time,showData} = this.state;

        return (
            <div className="sem-has-middle-bar" style={{height:'auto'}} onClick={()=>this.reportSetSelectState(null,{open:false})}>
                <SideCondition >
                    <SideConditionChild  className="search" text="查询条件"  height="40%">
                        <div className="side-search">
                            <table style={{width: '100%'}}>
                                <tbody>
                                <tr>
                                    <td style={{width: '20%'}}>报表类型:</td>
                                    <td style={{width: '40%'}}>
                                        <div>
                                            <MySelect onChange={(obj) => this.reportSetSelectState('community', obj)}
                                                      {...selectStates.getSelect('community')}
                                                      getData={() => this.getCommunityData()}
                                                      style={{width: '100%'}}>
                                                {selectStates.getSelect('community').open &&
                                                <SelectList {...selectStates.getSelect('community')}
                                                            onChange={(obj, cb) => {
                                                                this.reportSetSelectState('community', obj, cb);
                                                                obj.value && this.getGroupData(obj.value)
                                                            }}
                                                />}
                                            </MySelect>
                                        </div>
                                    </td>
                                    <td style={{width: '40%'}}>
                                        <div>
                                            <MySelect onChange={(obj) => {
                                                this.reportSetSelectState('searchTimeType', obj);
                                            }}
                                                      {...selectStates.getSelect('searchTimeType')}
                                                      style={{width: '100%'}}>
                                                {selectStates.getSelect('searchTimeType').open &&
                                                <SelectList {...selectStates.getSelect('searchTimeType')}
                                                            onChange={(obj, cb) => {
                                                                this.reportSetSelectState('searchTimeType', obj, cb);
                                                                this.handleSearchTypeChange(obj)
                                                            }}
                                                />}
                                            </MySelect>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{width: '20%'}}>
                                        起始日期:
                                    </td>
                                    <td style={{width: '40%'}}>
                                        {searchType === staticType.timeBaseOnEnum.multiYear &&
                                        <div>
                                            <DateSelect {...selectStates.getSelect('start')}
                                                        placeholder="开始年份"
                                                        endWith="year"
                                                        onChange={(obj) => {
                                                            this.reportSetSelectState('start', obj);
                                                        }}
                                                        handleClick={() => {
                                                            alert('onclick');
                                                        }}/>
                                        </div>
                                        }
                                        {searchType === staticType.timeBaseOnEnum.year &&
                                        <div>
                                            <DateSelect {...selectStates.getSelect('start')}
                                                        placeholder="选择起始月份"
                                                        endWith="month"
                                                        onChange={(obj) => {
                                                            this.reportSetSelectState('start', obj);
                                                        }}/>
                                        </div>
                                        }
                                        {searchType === staticType.timeBaseOnEnum.month &&
                                        <div>
                                            <DateSelect {...selectStates.getSelect('start')}
                                                        placeholder="选择起始日期"
                                                        endWith="day"
                                                        onChange={(obj) => {
                                                            this.reportSetSelectState('start', obj);
                                                        }}/>
                                        </div>
                                        }
                                        {searchType === staticType.timeBaseOnEnum.day &&
                                        <div>
                                            <DateSelect {...selectStates.getSelect('start')}
                                                        placeholder="选择日期"
                                                        endWith="day"
                                                        date={new Date(2017, 2, 20)}
                                                        onChange={(obj) => {
                                                            let endObj = Object.assign({}, obj);
                                                            if (obj.value) {
                                                                endObj.value = moment(obj.value).add(1, 'day').add(-1, 'second').toDate()
                                                            }
                                                            this.reportSetSelectState(['start', 'end'], [obj, endObj]);
                                                        }}/>
                                        </div>
                                        }
                                    </td>
                                    <td style={{width: '40%'}}>
                                        {searchType === staticType.timeBaseOnEnum.multiYear &&
                                        <div>
                                            <DateSelect {...selectStates.getSelect('end')}
                                                        placeholder="结束年份"
                                                        endWith="year"
                                                        onChange={(obj) => {
                                                            if (obj.value) {
                                                                obj.value = moment(obj.value).add(1, 'year').add(-1, 'second').toDate()
                                                            }
                                                            this.reportSetSelectState('end', obj);
                                                        }
                                                        }/>
                                        </div>
                                        }

                                        {searchType === staticType.timeBaseOnEnum.year &&
                                        <div>
                                            <DateSelect {...selectStates.getSelect('end')}
                                                        placeholder="选择结束月份"
                                                        endWith="month"
                                                        onChange={(obj) => {
                                                            if (obj.value) {
                                                                obj.value = moment(obj.value).add(1, 'month').add(-1, 'second').toDate()
                                                            }
                                                            this.reportSetSelectState('end', obj);
                                                        }}/>
                                        </div>
                                        }

                                        {searchType === staticType.timeBaseOnEnum.month &&
                                        <div>
                                            <DateSelect {...selectStates.getSelect('end')}
                                                        placeholder="选择起始日期"
                                                        endWith="day"
                                                        onChange={(obj) => {
                                                            if (obj.value) {
                                                                obj.value = moment(obj.value).add(1, 'day').add(-1, 'second').toDate()
                                                            }
                                                            this.reportSetSelectState('end', obj);
                                                        }}/>
                                        </div>
                                        }

                                    </td>
                                </tr>
                                </tbody>
                            </table>

                            <div style={{textAlign: 'center'}}>
                                <Button className="condition-button" onClick={this.search.bind(this)}>查询</Button>
                            </div>
                        </div>
                    </SideConditionChild>
                    <SideConditionChild className="list" text="选择区域" style={{padding:'0'}}>
                        <div className="group-condition-wrapper" >
                            {isLoadingGroup?<PreLoader/>
                                : <TreeList data={treeData} onClick={(item)=>this.handleTreeList(item)}
                                            handleCheck={(val)=>{this.setState({currentGroupId:val});
                                            this.search(val)}}
                                            value={currentGroupId}/>}
                        </div>
                    </SideConditionChild>
                </SideCondition>
                <div className="sem-main-content"
                     style={{width:'100%',height:'auto',border:'1px solid#dfdfdf',backgroundColor:'#ffffff',overflowY:'visible'}}>
                    {
                        isLoadingHistoryData ?<PreLoader />:
                            <PanelTable text="用电报表" align="left">
                                <div style={{height: 'auto',overflowX:'scroll'}}>

                                    <Table stripped={true}>
                                        <thead >
                                        <tr>

                                            <Table.Th className="large">设备名称/编码</Table.Th>
                                            {
                                                showData.titles&&showData.titles.map((m,n)=>{
                                                    return(
                                                        <Table.Th className="min" key={n}>{m}</Table.Th>
                                                    )
                                                })
                                            }
                                            <Table.Th className="large">总共</Table.Th>
                                        </tr>
                                        </thead>
                                        <Table.Body>
                                            {
                                                showData.data&&showData.data.map((t,i)=> {
                                                    return (
                                                        <tr key={i}>
                                                            
                                                            {
                                                                t&&t.map((m,n)=>{
                                                                    if(n == 0){
                                                                        return (<Table.Td className="large" key={n}>{m}</Table.Td>)
                                                                    }else{
                                                                        return (<Table.Td className="min" key={n} title={t[0]}>{m}</Table.Td>)
                                                                    }
                                                                })
                                                            }
                                                        </tr>
                                                    )
                                                })
                                            }
                                            <tr>
                                                <Table.Td className="large">总共</Table.Td>
                                                {
                                                    totalArray&&totalArray.map((d,i) => {
                                                        return(<Table.Td className="large" key={i}>{d}</Table.Td>)
                                                    })
                                                }
                                            </tr>

                                        </Table.Body>
                                    </Table>
                                </div>
                        </PanelTable>
                    }
                    <br/>
                   <span style={{position: 'absolute',top: 13,left:100}}>{time}</span>
                    <Button type="outline"
                            hasAddOn={true}
                            onClick={()=>{
                                this.downLoad();
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                            }}
                    >
                        <Button.AddOn
                            src={icons.exports}
                        />
                        导出表格
                    </Button>
                    {
                        isDownLoad&&<iframe id="down-file-iframe" src={downLoadSrc}  style={{display:"none"}}></iframe>
                    }
                </div>
            </div>
        )
    };
}
module.exports = Statement;
