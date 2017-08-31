/**
 * Created by Hwa on 2017/4/6.
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import {TreeList,Tree} from 'redux-components/treeList'
import PreLoader from 'redux-components/preloader'
import Button from 'redux-components/button'
import store from 'store'
import auth from 'auth'
import {withRouter} from 'react-router'
import apis from 'apis'
import {Link} from 'react-router'
import './location.scss'

class Location extends BaseComponent{

    constructor(props){
        super(...arguments);
        this.state={
            //小区
            community: '',
            //分组
            group: '',
            currentGroupId:-1,
            treeData:null,
            isLoadedGroup: false,
            from:'',
        }
    }


    componentDidMount(){
        let id = store.get('communityId');
        this.getGroupData(id);
        this.setState({from:this.props.location.query.from,
            selectId:this.props.location.query.currentId?
                this.props.location.query.currentId:store.get('communityId'),
            selectName:store.get('communityName')});
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
                        level:c.Level,
                    }
                });
                const dataTree = new Tree(list);
                const treeData = dataTree.init({name:'全部区域',value:id});
                const level2Data = dataTree.getLevel2Data();
                this.setState({
                    community:id,
                    isLoadingGroup:false,
                    treeData:treeData,
                    level2Data: level2Data
                });
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

    handleTreeList(item) {
        let data = this.state.treeData;
        data = Tree.setShow(item, data);
        this.setState({treeData: data})
    }

    render(){
        const {community,group,currentGroupId,treeData,isLoadingGroup,selectId,selectName,from,level2Data} = this.state;
        return(
            <div className="loc-wrapper">
                <div className="loc-title">
                    <span>总区域：{selectName}</span>
                </div>
                <div className="group-condition-wrapper">
                    <div className="area-title">
                        <span>请选择子区域</span>
                    </div>
                    {isLoadingGroup?<PreLoader/>
                        : <TreeList data={treeData} onClick={(item)=>this.handleTreeList(item)}
                                    handleCheck={(val)=>{this.setState({currentGroupId:val},()=>this.setState({selectId:val}))}}
                                    value={selectId}
                                    level2Data={level2Data}community={community}/>}
                </div>

                <div className='btn-wrap'>
                    <Link to={{pathname:'/home/'+from , query:{id:selectId}}}>
                        <Button className="condition-button">确认</Button>
                    </Link>
                </div>
            </div>
        )
    }

}
module.exports = withRouter(Location);