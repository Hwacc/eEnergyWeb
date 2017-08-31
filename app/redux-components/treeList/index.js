/**
 * Created by whj57 on 2016/12/16.
 */
import React, {Component} from 'react'
import classnames from 'classnames'
import './style.scss'
import {treeList} from 'icons'

export  class Tree {
    constructor(data) {
        //这数据有毒..
        let levelData = data.map((item,index)=>{
            if(item.level === 1){
                delete data[index];
            }
            if(item.level === 2){
                return item;
            }
        });
        this.data = data;
        this.level2Data = this._cleanArray(levelData);
    }

    getLevel2Data(){
        return this.level2Data;
    }

    _cleanArray(actual){
        let newArray = new Array();
        for(let i = 0; i<actual.length; i++){
            if (actual[i]){
                newArray.push(actual[i]);
            }
        }
        return newArray;
    }

    findParent(obj){
        let length = this.data.length
        let catalogArray = obj.catalogArray.slice()
        let isFound = false
        catalogArray.pop()
        while (catalogArray.length>0&&!isFound){
            if(obj.catalogArray.length ==1){
                let childrenLength = this.data[0].children.length
                this.data[0].children[childrenLength] = obj
                isFound = true
            } else {
                let key = catalogArray.pop()
                for(let j =0;j<length;j++){
                    if(key == this.data[j].value){
                        let childrenLength = this.data[j].children.length
                        this.data[j].children[childrenLength] = obj
                        isFound = true
                    }
                }
            }
        }
        if(!isFound){
            let childrenLength = this.data[0].children.length
            this.data[0].children[childrenLength] = obj
        }
    }
    getData() {
        return this.data
    }

    static compare(a, b) {
        let tempA = a.split('|');
        let tempB = b.split('|');
        if (Array.isArray(tempA) && Array.isArray(tempB)) {
            let length = tempA.length > tempB.length ? tempA.length : tempB.length;
            for (var i = 0; i < length; i++) {
                if (tempA[i] == undefined) {
                    tempA[i] = 0
                }
                if (tempB[i] == undefined) {
                    tempB[i] = 0
                }
                if (tempA[i] * 1 > tempB[i] * 1) {
                    return false
                }
                if (tempA[i] * 1 < tempB[i] * 1) {
                    return true
                }
            }
        }
        return true

    }

    sortBy() {
        let result = null;
        let temp = this.data;
        temp.map((item)=> {
            item.isDirty = this.getIsDirtyData(item);
            item.children = [];
            if (result) {
                let num = null;
                let isCompare = true;
                result.some((i, index)=> {
                    isCompare = Tree.compare(i.catalog, item.catalog);
                    if (!isCompare) {
                        num = index
                    }
                    return !isCompare
                });
                if (isCompare) {
                    result.push(item)
                } else {
                    result.splice(num, 0, item);
                }
            } else {
                result = [item]
            }
        });
        this.data = result
    }

    getIsDirtyData(item) {
        let length = item.catalogArray.length;
        if (length < 2) {
            return true
        }
        let data = this.data.concat();
        let compareArray = item.catalogArray.concat();
        compareArray.pop();
        let compareString = compareArray.join('|');
        let iString = null;
        return !data.some((i)=> {
            iString = i.catalogArray.join('|');
            return iString == compareString
        })
    }

    init(firstNode) {
        this.data = this.data.map((item)=> {
            let catalogArray = item.catalog.split('|');
            item.catalogArray = catalogArray;
            item.show = catalogArray.length < 1;
            item.isDisplay = true;
            return item
        });
        this.sortBy();
        let placeholder = {
            catalog: null,
            catalogArray: [],
            value: '0',
            name: '全部',
            show: true,
            isDisplay: true,
            children:[]
        };
        let _firstNode = Object.assign({}, placeholder, firstNode);
        this.data&&this.data.unshift(_firstNode);
        if(this.data){
            for(let i = 1;i < this.data.length;i++){
                this.findParent(this.data[i])
            }
        }
        return this.data;
    }
    static setShow (val,data){
        let result = [];
        if(Array.isArray(data)){
            result = data.map((item)=>{
                if(item.value==val.value){
                    item.show = !val.show
                }
                return item
            })
        }
        return result;
    }
}

/*export const Tree = function(data){
    this.data = data.map((item)=>{item.show = false;return item});
    this.getData = ()=>this.data;
    this.compare = (a,b)=>{
        let tempA = a.split('|');
        let tempB = b.split('|');
        if(Array.isArray(tempA)&&Array.isArray(tempB)){
            let length = tempA.length>tempB.length?tempA.length:tempB.length;
            for(var i = 0;i<length;i++){
                if(tempA[i]==undefined){
                    tempA[i] = 0
                }
                if(tempB[i] == undefined){
                    tempB[i] = 0
                }
                if(tempA[i]*1>tempB[i]*1){
                    return false
                }
                if(tempA[i]*1<tempB[i]*1){
                    return true
                }
            }
        }
        return true
    };
    this.sortBy = ()=>{
        let result = null;
        let temp = this.data;
        temp.map((item)=>{
            item.isDirty = this.getIsDirtyData(item);
            if(result){
                let num = null;
                let isCompare = true;
                result.some((i,index)=>{
                    isCompare = this.compare(i.catalog,item.catalog);
                    if(!isCompare){
                        num = index
                    }
                    return !isCompare
                });
                if(isCompare){
                    result.push(item)
                }else {
                    result.splice(num,0,item);
                }
            }else{
                result = [item]
            }
        });
        this.data = result
    };
    this.getIsDirtyData = (item)=>{
        let length = item.catalogArray.length;
        if(length<2){
            return false
        }
        let data = this.data.concat();
        let compareArray = item.catalogArray.concat();
        compareArray.pop();
        let compareString = compareArray.join('|');
        let iString  = null;
        return !data.some((i)=>{iString = i.catalogArray.join('|');return iString==compareString})
    };
    this.init = (data,firstNode)=>{
        this.data = data.map((item)=>{
            let catalogArray = item.catalog.split('|');
            item.catalogArray = catalogArray;
            item.show = catalogArray.length<1;
            item.isDisplay = true;
            return item
        });
        this.sortBy();
        let placeholder = {
            catalog:null,
            catalogArray:[],
            value:'0',
            name:'全部',
            show:true,
            isDisplay:true
        };
        let _firstNode = Object.assign({},placeholder,firstNode)
        this.data.unshift(_firstNode);
        return this.data;
    };
    this.setShow = (val,data)=>{
        let result = [];
        if(Array.isArray(data)){
            result = data.map((item)=>{
                if(item.value==val.value){
                    item.show = !val.show
                }
                return item
            })
        }
        return result
    }
};*/
export  const TreeList = (props)=>{
    if(props.data&&props.data[0]){
        let parent = props.data[0]
        return(
            <div className="tree-list">
                <Ul parent={parent} {...props}/>
            </div>
        )
    }else {
        return(
            <div>没数据</div>
        )
    }
};
/*const Ul = (props)=>{
    let {data,value,handleCheck,onClick,multiple,isSelecteImg} = props;
    if(!Array.isArray(data)){return <div></div>};
    let tempData = data.concat();
    let parent = tempData.shift();
    const ulHandleCheck = (val)=>{
        if(multiple){
            let values = value.concat();
            if(values.some(i=>i==val)){
                values = values.filter(v=>v!=val)
            }else {
                values.push(val)
            }
            handleCheck(values)
        }else {
            handleCheck(val)
        }
    };
    const getChildrenData = (data,index)=>{
        let result = [];
        for(let i = index;i<data.length;i++){
            let item = isBelong(parent,data[i]);
            if(item.isbelong){
                result.push(item.value);
            }else {
                return result
            }
        }
        return result
    };
    const isBelong = (parent,item)=>{
        let length = parent.catalogArray.length;
        if(length==0){
            return {
                value:item,
                isbelong:true
            }
        }
        let parentString = parent.catalog;
        let temp = [];
        for(let i = 0;i<length;i++){
            temp.push(item.catalogArray[i])
        }
        let tempString = temp.join('|');
        let isbelong = (tempString==parentString||item.catalogArray.length-length>1);
        return{
            value:item,
            isbelong:isbelong
        }
    };
    const getIsHaveChild= (item,data)=>{
        if(tempData.length>0){
            return item.catalogArray.length<data[0].catalogArray.length
        }
        return false
    };
    const isHaveChild = getIsHaveChild(parent,tempData);
    let classImg = "";
    if(isHaveChild){
        classImg = !parent.show?treeList.open:treeList.close;
    }
    let isChecked = multiple?value.some(i=>i==parent.value):value==parent.value;
    let nameClass = classnames('tree-li-name', {
        'isHaveChild':!isHaveChild
    });
    if(!isSelecteImg){
        nameClass = classnames(nameClass,{
            'checked':isChecked,
        })
    }
    console.log(parent)
    return(
        <li className="tree-li" style={parent&&parent.isDisplay?{}:{visibility:'hidden'}}>
            {isHaveChild&&<img onClick={()=>onClick(parent)} className="tree-li-img"
                              src={classImg}/>}
            <div className={nameClass} onClick={()=>ulHandleCheck(parent.value*1)}>
                {parent.name}{isSelecteImg&&<span className={isChecked?"select-img":'select'}></span>}
            </div>

            {
                parent.show&&isHaveChild&&
                <ul className="tree-ul">
                    {
                        tempData.map((item,index)=>{
                            if((tempData[0].catalogArray.length == item.catalogArray.length)||item.isDirty){
                                let childrenData = getChildrenData(tempData,index);
                                if(childrenData.length>0) {
                                    let childProps = Object.assign({},props,{data:childrenData})
                                    return <Ul {...childProps} key={index}/>
                                }
                            }
                        })

                    }
                </ul>
            }</li>

    )
};*/
const Ul = (props)=>{
    let { parent,data,value,handleCheck,onClick,multiple,isSelecteImg,level2Data,community} = props;
    const ulHandleCheck = (val)=>{
        if(multiple){
            let values = value.concat();
            if(values.some(i=>i==val)){
                values = values.filter(v=>v!=val)
            }else {
                values.push(val)
            }
            handleCheck(values)
        }else {
           if(val == community && level2Data.length == 1){
                handleCheck(level2Data[0].value);
            }else{
                handleCheck(val);
            }
        }
    };

    //if(!Array.isArray(data)){return <div></div>};
   /* let tempData = data.concat();
    let parent = tempData.shift();

    const getChildrenData = (data,index)=>{
        let result = [];
        for(let i = index;i<data.length;i++){
            let item = isBelong(parent,data[i]);
            if(item.isbelong){
                result.push(item.value);
            }else {
                return result
            }
        }
        return result
    };
    const isBelong = (parent,item)=>{
        let length = parent.catalogArray.length;
        if(length==0){
            return {
                value:item,
                isbelong:true
            }
        }
        let parentString = parent.catalog;
        let temp = [];
        for(let i = 0;i<length;i++){
            temp.push(item.catalogArray[i])
        }
        let tempString = temp.join('|');
        let isbelong = (tempString==parentString||item.catalogArray.length-length>1);
        return{
            value:item,
            isbelong:isbelong
        }
    };
    const getIsHaveChild= (item,data)=>{
        if(tempData.length>0){
            return item.catalogArray.length<data[0].catalogArray.length
        }
        return false
    };
    const isHaveChild = getIsHaveChild(parent,tempData);
    let classImg = "";
    if(isHaveChild){
        classImg = !parent.show?treeList.open:treeList.close;
    }
    let isChecked = multiple?value.some(i=>i==parent.value):value==parent.value;
    let nameClass = classnames('tree-li-name', {
        'isHaveChild':!isHaveChild
    });
    if(!isSelecteImg){
        nameClass = classnames(nameClass,{
            'checked':isChecked,
        })
    }

    console.log(parent)*/
    let isChecked = multiple?value.some(i=>i==parent.value):value==parent.value;
    let classImg = "";
    let isHaveChild = parent.children.length>0
    let nameClass = classnames('tree-li-name', {
        'isHaveChild':!isHaveChild
    });
    if(!isSelecteImg){
        nameClass = classnames(nameClass,{
            'checked':isChecked,
        })
    }
    if(isHaveChild){
        classImg = !parent.show?treeList.open:treeList.close;
    }
    return(
        <li className="tree-li" style={parent&&parent.isDisplay?{}:{visibility:'hidden'}}>
            <div className={nameClass} onClick={()=>{ulHandleCheck(parent.value*1);onClick(parent)}}>
                {isHaveChild&&<img className="tree-li-img"
                                   src={classImg}/>}
                {parent.name}{isSelecteImg&&<span className={isChecked?"select-img":'select'}></span>}
            </div>

            {
                parent.show&&isHaveChild&&
                <ul className="tree-ul">
                    {
                        parent.children.map((item,index)=>{
                            return <Ul {...props} parent={item} key={index}/>
                        })

                    }
                </ul>
            }</li>

    )
};
Ul.defaultProps={
    onClick:()=>{}
};
export default TreeList
