/**
 * Created by whj on 2016/7/12.
 */
import React,{Component} from 'react'
import classNames from 'classnames'
import BaseComponent from '../basecomponent'
import {findDOMNode} from 'react-dom'
import './style.scss'
import $ from 'jquery'
import apis from 'apis'
class ProvinceList extends BaseComponent{
    constructor(){
        super(...arguments);
    }

    /**
     * 加载省
     */
    render(){
        const {provinceList,pid,loadCity,chooseProvince,show} = this.props;
        const className = classNames('province-list list',{
            'show':show
        });
        return (
            <div className={className}>
                {
                    provinceList.map((t,index)=>{
                        if(t.value==pid){
                            return <span className="check item"  key={index}>{t.name}</span>
                        }else {
                            return <span className="item" key={index} onClick={()=>{loadCity(t);chooseProvince(t)}}>
                            {t.name}
                        </span>
                        }

                    })

                }
            </div>
        )
    }
}

class CityList extends BaseComponent{
    constructor(){
        super(...arguments);
    }
    render(){
        let {cityList,cid,loadDist,show} = this.props;
        const className = classNames('city-list list',{
            'show':show
        });
        return (
            <div className={className}>
                {
                    cityList.map((t,index)=>{
                        if(t.value==cid){
                            return <span className="check item" key={index}>{t.name}</span>
                        }else {
                            return <span className="item" key={index} onClick={()=>loadDist(t)}>
                            {t.name}
                        </span>
                        }
                    })

                }
            </div>
        )
    }
}

class DistList extends BaseComponent{
    constructor(){
        super(...arguments);
    }
    render(){
        let {distList,did,loadCommunity,show} = this.props;
        const className = classNames('dist-list list',{
            'show':show
        });
        return (
            <div className={className}>
                {
                    distList.map((t,index)=>{
                        if(t.value==did){
                            return <span className="check item" key={index}>{t.name}</span>
                        }else {
                            return <span className="item" key={index} onClick={()=>loadCommunity(t)}>
                            {t.name}
                        </span>
                        }

                    })

                }
            </div>
        )
    }

}

class CommunityList extends BaseComponent{
    constructor(){
        super(...arguments);
    }
    render(){
        let {communityList,id,chooseCommunity,show,close,handleChange,
        pid,cid,did} = this.props;
        const className = classNames('community-list list',{
            'show':show
        });
        return(
            <div className={className}>
                {
                    communityList.map((t,index)=>{
                        if(t.value==id){
                            return <span className="check item" key={index} onClick={close}>{t.name}</span>
                        }else {
                            return <span className="item" key={index} onClick={()=>{chooseCommunity(t);close();
                            handleChange({ProvinceId:pid,CityId:cid,DistrictId:did,CommunityId:t.value})}} >
                            {t.name}
                        </span>
                        }

                    })

                }
            </div>
        )

    }

}

class AddressSelect extends BaseComponent{
    constructor(){
        super(...arguments);
        this.state = {
            //省
            provinceList: [],
            isLoadingProvince: false,
            //市
            cityList: [],
            isLoadingCity: false,
            //区
            distList: [],
            isLoadingDist: false,
            //小区
            communityList: [],
            isLoadingCommunity: false,
            //checked
            province: {
                value: this.props.province
            },
            city: {
                value: this.props.city
            },
            dist: {
                value: this.props.dist
            },
            community: {
                value: this.props.community
            },
            show:{
                province:true,
                city:false,
                dist:false,
                community:false
            },
            open:false
        }
    }
    //选择省
    chooseProvince(t){
        this.setState({
            province:t,
        })
    }
    //选择小区
    chooseCommunity(t){
        this.setState({
            community:t
        })
    }
    //加载省
    loadProvince(callBack) {
        this.provinRP = apis.address.getProvince();
        this.registerRequest(this.provinRP.request);
        this.setState({
            isLoadingProvince: true,
        });
        this.provinRP.promise
            .then((res)=> {
                callBack&&callBack(res.Data)
                let data = res.Data || [];
                let list = data.map((c)=> {
                    return {
                        name: c.Name,
                        value: c.Id
                    }
                });
                this.setState({
                    provinceList: list,
                    isLoadingProvince: false
                });

            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoadingProvince: false,
                        isLoadFailed: true
                    });
                }
            })
    }
    //加载市
    loadCity(t,callBack) {
        let id = t.value;
        this.cityRP = apis.address.getCity(id);
        this.registerRequest(this.cityRP.request);
        this.setState({
            isLoadingCity: true,
            city:{},
            dist:{},
            community:{},
            show:{
                city:true
            }
        });
        this.cityRP.promise
            .then((res)=> {
                callBack&&callBack(res.Data)
                let data = res.Data || [];
                let list = data.map((c)=> {
                    return {
                        name: c.Name,
                        value: c.Id
                    }
                });
                this.setState({
                    cityList: list,
                    isLoadingCity: false
                });

            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoading: false,
                        isLoadFailed: true
                    });
                }
            })
    }
    //加载区
    loadDist(t,callBack) {
        let id = t.value
        this.districtRP = apis.address.getDistrict(id);
        this.registerRequest(this.districtRP.request);
        this.setState({
            isLoadingDist: false,
            city:t,
            dist:{},
            community:{},
            show:{
                dist:true
            }
        });
        this.districtRP.promise
            .then((res)=> {
                callBack&&callBack(res.Data);
                let data = res.Data || [];
                let list = data.map((c)=> {
                    return {
                        name: c.Name,
                        value: c.Id
                    }
                });

                this.setState({
                    distList: list,
                    isLoadingDist: false
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoading: false,
                        isLoadFailed: true
                    });
                }
            })
    }
    //加载小区
    loadCommunity(t,callBack) {
        let pid = this.state.province.value,
            cid = this.state.city.value,
            did = t.value;
        this.communityRP = apis.address.getCommunity(pid,cid,did);
        this.registerRequest(this.communityRP.request);
        this.setState({
            isLoadingCommunity: true,
            isLoadFailed: false,
            dist:t,
            community:{},
            show:{
                community:true
            }
        });
        this.communityRP.promise
            .then((res)=> {
                callBack&&callBack(res.Data)
                let data = res.Data || [];
                let list = data.map((c)=> {
                    return {
                        name: c.Name,
                        value: c.Id
                    }
                });

                this.setState({
                    communityList: list,
                    isLoadingCommunity: false
                });
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                    this.setState({
                        isLoading: false,
                        isLoadFailed: true
                    });
                }
            })
    }
    close(){
        this.setState({
            open:false
        })
    }
    componentDidMount() {
        //初始化
        let {province,city,dist,community} = this.state;
        this.loadProvince((data)=>{
            data.map((t)=>{
                if(t.Id==province.value){
                    this.setState({
                        province:{
                            name:t.Name,
                            value:t.Id
                        }
                    })
                }
            })
        })
        this.loadCity(province,
            (data)=>{
                data.map((t)=>{
                    if(t.Id==city.value){
                        this.setState({
                            city:{
                                name:t.Name,
                                value:t.Id
                            }
                        })
                    }
                })
            });
        this.loadDist(city,(data)=>{
            data.map((t)=>{
                if(t.Id==dist.value){
                    this.setState({
                        dist:{
                            name:t.Name,
                            value:t.Id
                        }
                    })
                }
            })
        });
        this.loadCommunity(dist,(data)=>{
            data.map((t)=>{
                if(t.Id == community.value){
                    this.setState({
                        community:{
                            name:t.Name,
                            value:t.Id
                        }
                    })
                }
            })
        })
        let componentDOM = findDOMNode(this);
        this._winClickHandler = function (e) {
            let has = false;
            let target = e.target;
            if (componentDOM === target || $(target).closest($(componentDOM)).length) {
                has = true;
            }
            !has && this.close();
        }.bind(this);

        $(window).on('click', this._winClickHandler);
    }

    componentWillUnmount() {
        $(window).off('click', this._winClickHandler);
    }
    render(){
        let {provinceList,isLoadingProvince,cityList,isLoadingCity,
            distList,isLoadingDist,communityList,isLoadingCommunity,
            province,city,dist,community,show,open}=this.state;
        const className=classNames('select-drop-icon',{
            'open':open
        })
        return(
            <div className="address-select" >
                <div className="address-input" onClick={()=>{this.setState({open:!open})}}>
                    <span className="province-name" onClick={(e)=>{open&&e.stopPropagation();this.setState({ show:{province:true}})}}>
                        {province.name&&province.name}</span>
                    <span className="city-name" onClick={(e)=>{open&&e.stopPropagation();this.setState({show:{city:true}})}}>
                        {city.name&&' /'+city.name}</span>
                    <span className="dist-name" onClick={(e)=>{open&&e.stopPropagation();this.setState({show:{dist:true}})}}>
                        {dist.name&&' /'+dist.name}</span>
                    <span className="community-name" onClick={(e)=>{open&&e.stopPropagation();this.setState({show:{community:true}})}}>
                        {community.name&&' /'+community.name}</span>
                    <span className={className}></span>
                </div>
                {
                    open&&<div className="drop-down-group">
                        <span className="arrow"> </span>
                        <div className="choose-list">
                            <div className="button-list">
                                <div className={show.province&&'show'} onClick={()=>{this.setState({ show:{province:true}})}}>省</div>
                                <div className={show.city&&'show'} onClick={()=>{this.setState({show:{city:true}})}}>市</div>
                                <div className={show.dist&&'show'} onClick={()=>{this.setState({show:{dist:true}})}}>区</div>
                                <div className={show.community&&'show'} onClick={()=>{this.setState({show:{community:true}})}}>小区</div>
                            </div>
                            <div className="group-list">
                                {
                                    !isLoadingProvince&&
                                    <ProvinceList provinceList={provinceList} pid={province.value}
                                                  loadCity={this.loadCity.bind(this)} show={show.province}
                                                  chooseProvince={this.chooseProvince.bind(this)}/>
                                }
                                {
                                    province.value&&!isLoadingCity&&
                                    <CityList cityList={cityList} pid={province.value} cid={city.value}
                                              loadDist={this.loadDist.bind(this)} show={show.city}/>
                                }
                                {
                                    city.value&&!isLoadingDist&&
                                    <DistList distList={distList} pid={province.value} cid={city.value} show={show.dist}
                                              did={dist.value} loadCommunity={this.loadCommunity.bind(this)}/>
                                }
                                {
                                    dist.value&&!isLoadingCommunity&&
                                    <CommunityList communityList={communityList}  id={community.value} close={this.close.bind(this)}
                                                   chooseCommunity={this.chooseCommunity.bind(this)} show={show.community} 
                                                   handleChange={this.props.onChange} pid={province.value} cid={city.value}
                                                   did={dist.value}/>
                                }
                            </div>
                        </div>
                    </div>
                }
            </div>)
    }
}
export default AddressSelect;