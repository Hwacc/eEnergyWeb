/**
 * Created by whj on 2016/6/20.
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'redux-components/rmodal'
import apis from 'apis'
import Button from 'redux-components/button'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
import {TreeList,Tree} from 'redux-components/treeList'
import store from 'store'


export default class EditModal extends BaseComponent {
    constructor(props){
        super(...arguments);
        this.state={
            isSave:false,
            treeData:null,
            currentGroupId:[],
            isShow:false,
            path:[],
        }
    }
    handleTreeList(item){
        let data = this.state.treeData;
        data = Tree.setShow(item,data);
        this.setState({treeData:data})
    }
   
    /*获取数据*/
    getInitData(){
        this.groupRP = apis.group.getGroupListByCommunityID();
        this.registerRequest(this.groupRP.request);
        this.setState({
            isLoadingGroup:true,
            treeData:null,
        });
        this.groupRP.promise
            .then(res=>{
                let data = res.Data||[];
                let treeTop={};
                data.map((d,i)=>{
                    if(d.Id == 1000){
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
                    treeData:treeData
                });
            })
            .catch(err=>{
                if (!err.abort) {
                    this.setState({
                        isLoadingGroup:false,
                        treeData:null
                    });;
                }
            })
    }
    componentWillMount  (){
        const openAnimation = ()=>this.setState({isShow:true});
        setTimeout(openAnimation,0);
        this.getInitData()
    }
    /**
     * 保存编辑更改
     */
    savingChange() {
        let {treeData,currentGroupId}  = this.state;
        let group ={};
        treeData.map((item)=>{
            if(item.value == currentGroupId){
                group = item
            }
        });
        this.handleClose()
        store.set('level',group.level)
        store.set('group',group)
        if(group.level !== 0){
            store.set('communityId',group.value) 
        }
        this.props.check(group)
        
    }
    handleData(id){
        let treeData  = this.state.treeData;
        let catalogArray =[];
        let path = [];
        treeData.map((item,index)=>{
            if(item.value ==id){
                catalogArray = item.catalogArray
               
            }
        });
        catalogArray.length&&catalogArray.map((c,i)=>{
            treeData.map((item,index)=>{
                if(item.value ==c){
                    path.push(item.name)
                }
            });
        })
        this.setState({
            path: path.join(' — ')
        });
    }
    
    handleClose() {
        
        this.setState({
            isShow: false
        });
        setTimeout(this.props.hideEditModal,300);
       
    }
    render(){
        const {isShow,path,treeData,isLoadingGroup,currentGroupId} = this.state;
        return(
            <Modal width="540" height="480" show={isShow} onClick={()=>this.userSetSelectState(null,{open:false})}>
                <Modal.Header text="选择区域" align="center" onClose={()=>{this.handleClose()}}/>
                <Modal.Content isLoading={isLoadingGroup}
                                loadingText="正在获取区域"
                >
                    <div style={{height:280,width:'auto',border:'1px solid#dfdfdf',padding:'20px',overflow:'auto',boxSizing:'border-box'}}>
                        <TreeList data={treeData} onClick={(item)=>this.handleTreeList(item)}
                                    handleCheck={(val)=>{this.setState({currentGroupId:val});this.handleData(val) }}
                                    value={currentGroupId}/>

                    </div>
                    <div style={{height:20,lineHeight:'20px',margin:'20px 0'}}>
                      <span style={{display: 'inline-block',marginRight:20}}>已选区域</span>
                        <span>{path}</span>
                    </div>
                    <div className="text-center">
                        <Button size="thin" type="outline" style={{width:100,marginRight:50}}
                                onClick={()=>{this.handleClose();history.back()}}>取消
                        </Button>
                        <Button size="thin" style={{width:100}} onClick={()=>{this.savingChange()}}>保存
                        </Button>
                    </div>
                </Modal.Content>
            </Modal>
        )
    }
}




