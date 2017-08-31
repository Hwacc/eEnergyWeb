/**
 * Created by whj57 on 2016/12/1.
 */
import moment from 'moment'
import React from 'react'
import { energyInfo } from 'apis'
import BaseComponent from 'basecomponent'
import './style.scss'
import Weather from 'redux-components/weather'
import {homePage} from 'icons'
import store from 'store'
import apis from 'apis'
import LossCharts from './loss-statistics-charts'
import CompareCharts from './compare-charts'
import TendencyCharts from './effciency-tendency'
import PreLoader from 'redux-components/preloader'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
import Promise from 'q'
import Button from 'redux-components/button'
import {getParentNode} from 'utils'
import * as staticType from 'utils/staticType'
import {DateSelect,DateSelectState} from 'redux-components/dropdownselect/datepicker'
import Modal from 'redux-components/rmodal'



class HomePage extends BaseComponent{
    constructor(){
        super(...arguments);
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();
        let hour = now.getHours();
        let timeStart = "06:00",
            timeEnd = "18:00";
        let selectStates = new SelectState([['community',{}]])
        let dateStates = new DateSelectState([
            ['start',{value:moment(new Date(year,month,day)).add(-31,'day').toDate(),isMini:true,endWith:'day'}],
            ['end',{value:moment(new Date(year,month,day)).add(-1,'second').toDate(),isMini:true,endWith:'day'}]
        ]);
        dateStates.subMap(selectStates.getSelects());
        this.state={
            searchType:staticType.timeBaseOnEnum.month,
            devicesCount:0,
            community:null,
            // weather
            isLoadingWeather:false,
            weatherInfo:null,
            // compare
            isLoadingCompare:false,
            compareData:[],
            compareDaySearchTimeParams:[new Date(year, month, day),
                moment(now).add(-1, 'hour').toDate()],
            compareToDaySearchTimeParams:[moment(new Date(year, month, day)).add(-1,'day').toDate(),
                moment(now).add(-1, 'day').add(-1, 'hour').toDate()],


            
            compareMonthSearchTimeParams:[new Date(year, month, 1),
                moment(new Date(year, month,day)).add(1,'day').add(-1, 'second').toDate()],
            compareToMonthSearchTimeParams:[new Date(year, month-1, 1),
                moment(new Date(year, month-1,day)).add(1,'day').add(-1, 'second').toDate()],

            monthSearchTimeParams:[moment(new Date(year,month,day)).add(-1,'month').add(-1,'second').toDate(),
                moment(new Date(year,month,day)).add(-1, 'second').toDate()],
            //loss
            isLoadingLoss:false,
            lossSearchTypeParams: [moment(new Date(year, month, 1)).toDate(),
                moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()],
            lossSearchTimeParams: [timeStart, timeEnd],
            energyRankData: [],
            energyOverTimeData:[],
            //tendency
            isLoadingTendency:false,
            energyTendencyData:[],
            searchTypeTendencyParams:[new Date(year, month, 1), moment(new Date(year, month, 1)).add(1, 'month').add(-1, 'second').toDate()],
            //selects
            selectStates:dateStates,
            //useTypes
            useTypes:[],
            isLoadingWeatherDetail: false,
            weatherData:[],
            updateFlag:false,
        }
    }

      homeSetSelectState(type,obj,cb){
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

    //获取耗电统计数据
    getRankData(c){
        const {lossSearchTypeParams}  =this.state;
        this.childRP&&this.childRP.request.abort();
        this.energyRankInfoRP&&this.energyRankInfoRP.request.abort();
        this.setState({
            isLoadingLoss:true,
            energyMonthData:[],
        });
        this.childRP = apis.group.getGroupListByCommunityID(c);
        this.registerRequest(this.childRP.request);
        this.childRP.promise.then((res)=>{
            if(!res) return;
            let lastChild = res.Data[res.Data.length - 1];
            for(let i=0;i<res.Data.length;i++){
                if(res.Data[i].Level === 2){
                    lastChild = res.Data[i];
                    break;
                }
            }
            this.energyRankInfoRP = apis.energyInfo.getChildRank({
                From:2,
                GroupId:lastChild.Id,
                StartTime: moment(lossSearchTypeParams[0]).format('YYYY-MM-DD HH:mm:ss'),
                EndTime: moment(lossSearchTypeParams[1]).format('YYYY-MM-DD HH:mm:ss')

            });
            this.registerRequest(this.energyRankInfoRP.request);
            this.energyRankInfoRP.promise
                .then((res)=>{
                    if(!this.mounted)return;
                    this.setState({
                        energyRankData:res.Data||[],
                        isLoadingLoss:false
                    })
                })
                .catch((err)=>{
                    if(!err.abort){
                        this.setState({
                            isLoadingLoss:false
                        });
                        alert(err.message);
                    }
                })
        }).catch((err)=>{
            alert(err.message);
        });

    }
    //获取总电量
    formatData(data){
        let total = 0;
        if(Array.isArray(data)){
            data.map((item)=>{
                total= total + item.FlatEle + item.PeakEle + item.ValleyEle;
            })
        }
        return total.toFixed(2);
    }

    //获取温度曲线
    getTendencyWeather(c){
        let {selectStates} = this.state;
        let value = selectStates.getSelect('community').value;
        let cid = c||value;

        this.setState({
            isLoadingWeatherDetail:true,
            weatherData:[]
        });
        let postData={
            GroupId:cid,
            StartTime:moment(selectStates.getSelect('start').value).format('YYYY-MM-DD HH:mm:ss'),
            EndTime:moment(selectStates.getSelect('end').value).format('YYYY-MM-DD HH:mm:ss')
        }
        this.energyWeatherInfoRP&&this.energyWeatherInfoRP.request.abort();
        this.energyWeatherInfoRP = apis.energyInfo.getEnergyDayWeather(postData);
        this.registerRequest(this.energyWeatherInfoRP.request);
        this.energyWeatherInfoRP.promise
            .then(res=>{
                if(!this.mounted)return;
                this.setState({
                    weatherData:res.Data,
                    isLoadingWeatherDetail:false
                })

            }).catch(err=>{

            if (!err.abort) {
                this.setState({
                    isLoadingWeatherDetail:false
                });
                alert(err.message);
            }
        })

    }

    //获取用电曲线
    getTendencyData(c){
        let value = this.state.selectStates.getSelect('community').value;
        let cid = c||value;
        let {searchType,selectStates,weatherData} = this.state;
        this.setState({
            isLoadingTendency:true,
            energyTendencyData:[]
        });
        let postData={
            GroupId:cid,
            Form:searchType,
            StartTime:moment(selectStates.getSelect('start').value).format('YYYY-MM-DD HH:mm:ss'),
            EndTime:moment(selectStates.getSelect('end').value).format('YYYY-MM-DD HH:mm:ss')
        }
        this.energyDetailInfoRP&&this.energyDetailInfoRP.request.abort();
        this.energyDetailInfoRP = apis.energyInfo.getGroupDetail(postData);
        this.registerRequest(this.energyDetailInfoRP.request);
        this.energyDetailInfoRP.promise
            .then(res=>{
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
                            TotalEle: 0,
                            Temp: 0
                        };
                        res.Data && res.Data.some(i=> {
                            if (i.StatisticTime == start) {
                                obj.TotalEle = i.TotalEle ;
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
                this.setState({
                    energyTendencyData:list,
                    isLoadingTendency:false
           })



        }).catch(err=>{

            if (!err.abort) {
                this.setState({
                    isLoadingTendency:false
                });
                alert(err.message);
            }
        })
    }
    //获取比较统计
    getCompareData(c){
        this.setState({
            isLoadingCompare:true,
            compareData:[]});
        let {compareDaySearchTimeParams,compareToDaySearchTimeParams,
            compareToMonthSearchTimeParams,compareMonthSearchTimeParams} = this.state;
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate();

        //今天是本月最后一天
        let lastDay = (moment(new Date(year,month,1)).add(1,'month').add(-1,'second').toDate()).getDate();
        if(day ==lastDay ){
              compareToMonthSearchTimeParams=[new Date(year, month-1, 1),
                moment(new Date(year, month-1, 1)).add(1,'month').add(-1, 'second').toDate()];
        }
        this.energyInfoRP && this.energyInfoRP.request.abort();

        this.energyInfoRP = apis.energyInfo.getMultiTotal(
            {
                GroupId:c,
                TimeRanges:[{StartTime:moment(compareMonthSearchTimeParams[0]).format(),EndTime:moment(compareMonthSearchTimeParams[1]).format()},
                    {StartTime:moment(compareToMonthSearchTimeParams[0]).format(),EndTime:moment(compareToMonthSearchTimeParams[1]).format()},
                    {StartTime:moment(compareDaySearchTimeParams[0]).format(),EndTime:moment(compareDaySearchTimeParams[1]).format()},
                    {StartTime:moment(compareToDaySearchTimeParams[0]).format(),EndTime:moment(compareToDaySearchTimeParams[1]).format()},]
            }
        );

        this.registerRequest(this.energyInfoRP.request);
        this.energyInfoRP.promise.then((res)=>{
            if(!this.mounted)return;
            this.setState({
                compareData:res.Data,
                isLoadingCompare:false,
            })
        }).catch((err)=>{
            if (!err.abort) {
                this.setState({
                    isLoadingCompare: false,
                    isLoadingTendency:false

                });
                alert(err.message);
            }
        })
    }

    getCommunityData(){
        let {selectStates} = this.state;
        let list  = this.props.list;
        if(list.length>0){
            let communityId = store.get('communityId');
            let val = communityId||(list[0]?list[0].value:null);
            val = !selectStates.getSelect('community').multiple? val:[{value:val}];
            list[0]&&this.search(communityId||list[0].value);
            store.set('communityId',val);
            this.homeSetSelectState('community',{
                options: list,
                isLoading: false,
                value:val,
            });
            this.setState({updateFlag:true});
        }else{
            this.setState({updateFlag:false});
        }
    }

    componentDidMount(){
        this.getCommunityData()
    }

    componentDidUpdate(){
        if(this.props.list.length>0 && !this.state.updateFlag){ //防递归
            this.getCommunityData();
        }
    }


    search(c){
        let value = this.state.selectStates.getSelect('community').value;
        let cid = c||value;
        this.setState({
            isLoadingWeather:true
        });

        this.energyWeatherRP && this.energyWeatherRP.request.abort();
        this.energyWeatherRP = apis.group.getWeather(cid);
        this.registerRequest(this.energyWeatherRP.request);
        this.energyWeatherRP.promise
            .then((res)=>{
                if(!this.mounted)return;
                let data = res.Data||{};
                this.setState({
                    weatherInfo : data,
                    isLoadingWeather:false,
                    devicesCount:data.DevicesCount,
                });
                if(data.DevicesCount>0){
                    this.getRankData(cid);
                    this.getCompareData(cid);
                    this.getTendencyWeather(cid)
                    this.getTendencyData(cid);

                }else {
                    alert('无设备')
                }
            })

            .catch((err)=>{
                if(!err.abort){
                    alert(err.message);
                    this.setState({
                        isLoadingWeather:false
                    })
                }
            })
    }

    handleSearchTypeChange(obj) {

        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let day = now.getDate()-1;
        //按年查询
        if (obj=== staticType.timeBaseOnEnum.multiYear) {
            this.setState({searchType:staticType.timeBaseOnEnum.multiYear})
            this.homeSetSelectState(['start','end'],
                [
                    {value:moment(new Date(year, 0, 1)).add(-2, 'year').toDate()},
                    {value:moment(new Date(year, 0, 1)).add(1, 'year').add(-1, 'second').toDate()}
                ]);
        }
        else if (obj === staticType.timeBaseOnEnum.year) {
            this.setState({searchType:staticType.timeBaseOnEnum.year})
            this.homeSetSelectState(['start','end'],
                [
                    {value:moment(new Date(year, month, 1)).add(-11, 'month').toDate()},
                    {value:moment(new Date(year, month, 1)).add(1, 'month').add(-1, 'second').toDate()}
                ]);
        }
        //按月查询
        else if (obj === staticType.timeBaseOnEnum.month) {
            this.setState({searchType:staticType.timeBaseOnEnum.month})
            this.homeSetSelectState(['start','end'],
                [
                    {value:moment(new Date(year, month, day)).add(-30, 'day').toDate()},
                    {value:moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()}
                ]);
        }
        else {
            this.setState({
                searchType: staticType.timeBaseOnEnum.day
            });
            this.homeSetSelectState(['start','end'],
                [
                    {value:new Date(year, month, day)},
                    {value: moment(new Date(year, month, day)).add(1, 'day').add(-1, 'second').toDate()}
                ]);
        }
        this.getTendencyData();

    }

    render(){
        let{selectStates,energyRankData,isLoadingLoss,useTypes,searchType,isLoadingWeatherDetail,
            isLoadingCompare,weatherInfo,compareData,isLoadingTendency,energyTendencyData,devicesCount,totalPower,weatherData} = this.state;
        let firstFormData = {};
        if(weatherInfo){
            firstFormData.address = weatherInfo.Address;
            firstFormData.num = devicesCount;
            firstFormData.date = moment(weatherInfo.Weather.Date).format('YYYY.MM.DD');
            firstFormData.size = weatherInfo.Size;
            firstFormData.t = weatherInfo.Weather.Tempture;
            firstFormData.weatherCode = weatherInfo.WeatherCode;
        }
        let list = this.props.list;
        energyTendencyData.length&&energyTendencyData.map((t,i)=>{
            weatherData&&weatherData.some(d=>{
                if (d.Time == t.StatisticTime) {
                 return   t.Temp = d.Temp ;
                }
            });
        });
        return(

            <div className="sem-main-content" onClick={()=>this.homeSetSelectState(null,{open:false})}>
                <div className="home-page-wrapper">
                    <div className="page-top">
                        <div className="current-info">
                            <div className="title" >{weatherInfo?weatherInfo.Name:'楼宇'}信息</div>
                            <div className="info-content">
                                <div className="container">
                                    <div className="col-1"></div>
                                    <div className="col-3">
                                        <Weather className="weather col-5" t={firstFormData.t} code={firstFormData.weatherCode}/>
                                    </div>
                                    <div className="date col-2"> {firstFormData.date}</div>
                                    <div className="col-1"></div>

                                </div>
                                <div className="container" style={{marginBottom: 10}}>
                                    <div className="col-1"></div>
                                    <div className="col-3">
                                        <MySelect
                                            style={{maxWidth:'90%'}}
                                            onChange={(obj)=>this.homeSetSelectState('community',obj)}
                                            {...selectStates.getSelect('community')}>
                                            {selectStates.getSelect('community').open&&
                                            <SelectList {...selectStates.getSelect('community')}
                                                onChange = {(obj)=>{
                                                    this.homeSetSelectState('community',obj);
                                                    obj.value && store.set('communityId',obj.value);
                                                    obj.name && store.set('communityName',obj.name);}}
                                            />}
                                        </MySelect>
                                    </div>
                                    <div className="col-2">
                                        <Button style={{fontSize: 16}}
                                                onClick={()=>this.search()}
                                       >查询</Button>
                                    </div>
                                    <div className="col-1"></div>
                                </div>
                                <div className="container">
                                    <div className="col-1"></div>
                                    <div className="content-device-info col-8">
                                        <div className="address">
                                            <div className="icon"
                                                 style={{backgroundImage:`url(${homePage.address})`}}></div>
                                            <span className="word">{firstFormData.address}</span></div>
                                        <div className="size">
                                            <div className="icon"
                                                 style={{backgroundImage:`url(${homePage.size})`}}></div>
                                            <span className="word">{firstFormData.size||'0'}m²</span>
                                        </div>
                                        <div className="num">
                                            <div className="icon"
                                                 style={{backgroundImage:`url(${homePage.number})`}}></div>
                                            <span className="word">计量点数{firstFormData.num||'0'}个</span>
                                        </div>
                                    </div>
                                    <div className="col-1"></div>
                                </div>
                            </div>
                        </div>
                        <div className="compare-charts">
                            <PreLoader show={isLoadingCompare} text="正在获取用电信息"/>
                            {!isLoadingCompare&&<CompareCharts data={compareData}/>}
                        </div>
                        <div className="loss-statistics-charts">
                            <PreLoader show={isLoadingLoss} text="正在获取用电信息"/>
                            {!isLoadingLoss&&<LossCharts data={energyRankData}/>}

                        </div>
                    </div>

                    <div className="power-trend">
                        <div className="charts-total">单位：kWh</div>
                        <PreLoader show={isLoadingTendency || isLoadingWeatherDetail} text="正在获取用电信息" align={true}/>
                        {(!isLoadingWeatherDetail&&!isLoadingTendency)&&<TendencyCharts  data={energyTendencyData} searchType={searchType}/>}
                    </div>
                </div>
            </div>
        )
    }
}
module.exports = HomePage;
