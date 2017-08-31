/**
 * Created by whj57 on 2016/12/1.
 */
import React from 'react';
import './style.scss'
import classnames from 'classnames'
import Input from '../formcontrol'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

/**
 * 列表组件
 */
export const　SelectList = (props)=>{
    const {options,value,isLoading,isFailed,multiple,onChange,allowEmpty,callback,editable } = props;
    
    const handleSelect = function(e,item){
        e.stopPropagation();
        //单选模式
        if (!multiple) {
            if (allowEmpty) {
                let val;
                if(editable){
                    val =Object.assign(item,{open:false}) 
                }else{
                    val = value === item.value ? {value:null,name:null,open:false} : Object.assign(item,{open:false});
                }
                
                onChange(val,()=>{callback&&callback(val.value)});
            }
            else {
                onChange(Object.assign(item,{open:false}),()=>{callback&&callback(item.value)});
            }
        }
        //多选模式
        else {
            if (!value) {
                onChange({value:[item]},()=>{callback&&callback([item.value])});
            }
            else {
                //如果value已有此项，则为取消
                if (value.some((v)=>v.value === item.value)) {
                    let val = {value:value.filter((v)=>v.value !== item.value)}
                    onChange(val,()=>{callback&&callback(val.map((i)=>{return i.value}))})
                }
                else {
                    let val = {value:value.concat([item])}
                    onChange(val,()=>{callback&&callback(val.map((i)=>{return i.value}))});
                }
            }
        }
    };

    return (
        <div className="select-drop-down">
                <span className="arrow">
                </span>
            <div className="select-list">
                {
                    (()=> {
                        if (options && options.length > 0) {
                            //单选
                            if (!multiple) {
                                return options&&options.map((item, i)=> {
                                        return (
                                            <div key={i}
                                                 onClick={(e)=>handleSelect(e,item)}
                                                 className={'select-list-item ' + (value === item.value?'active':'')}>
                                                {item.name}
                                            </div>
                                        )
                                    })
                            }
                            //多选
                            else {
                                return options&&options.map((item, i)=> {
                                        //是否激活
                                        let active;
                                        if (!value && value.length === 0) {
                                            active = false;
                                        }
                                        else {
                                            active = value.some((v)=>v.value === item.value);
                                        }

                                        return (
                                            <div key={i}
                                                 onClick={(e)=>handleSelect(e,item)}
                                                 className={'select-list-item ' + (active?'active':'')}>
                                                {item.name}
                                            </div>
                                        )
                                    });
                            }
                        }
                        else if (isFailed) {
                            return <div className="empty">{'加载失败，请重试'} </div >
                        }
                        else {
                            return <div className="empty">{isLoading ? '正在加载...' : '没有可选择的项'} </div >
                        }
                    })()
                }
            </div>
        </div>
    )
};
SelectList.defaultProps = {
    options: [],
    onChange: ()=> {
        return;
    },
    allowEmpty: true,
};

/**
 * select选择框
 */
export const MySelect = (props)=>{
    const {placeholder,value,className,options,label,size,width,style,multiple,splitter,editable,little} = props;
    const classes = classnames('sem-select', className, {
        'open': props.open,
        'thin': size === 'thin',
        'editable':editable,
        'little':little
    });
    let showText = '';
   
    if ((value || value === 0) && options) {
        if (!multiple) {
            let option = options.filter((o)=> {
                return o.value === value;
            });
            showText = option[0] ? option[0].name : placeholder;
        }
        else {
            if (!Array.isArray(value)) {
                throw Error('多选情况下value必须是数组或者空值');
            }
            let activeOptions = options.filter((o)=> {
                return value.some((v)=> {
                    return o.value === v.value;
                });
            });

            if (!activeOptions.length) {
                showText = placeholder;
            }
            else {
                showText = activeOptions.map((ao)=>ao.name).join(splitter);
            }
        }
    }
    else {
        showText = placeholder;
    }
    let _style = style || {};
    //如果定义了宽度
    width && Object.assign(_style, style, {width: (width + '').replace('px', '') + 'px', minWidth: 'auto'});
    return(
        <div
            onClick={(e)=>{e.stopPropagation();props.onChange({open:!props.open});props.isFailed&&props.getData&&props.getData()}}
             style={_style}
             className={classes}>
            {
                editable?
                    <div >
                        <input 
                            value={showText}
                            onChange={(e)=>props.inputChange(e.target.value)}
                            className="select-input"
                        /></div>
                    :
                    <div className="select-picker">
                        {label && <span className="select-label">{label}</span>}
                        {showText}
                    </div>
            }
           
            <span className="select-drop-icon">
                </span>
            <ReactCSSTransitionGroup transitionName="fade-slide" transitionEnterTimeout={300}
                                     transitionLeaveTimeout={300}>
                {props.children}
            </ReactCSSTransitionGroup>
        </div>
    )
};
MySelect.defaultProps = {
    onOpen: ()=> {
    },
    placeholder: '请选择...',
    //自动关闭
    autoClose: true,
    //标签
    label: null,
    //是否开启多选
    multiple: false,
    //多选分隔符
    splitter: ',',
    allowEmpty: false,
    editable: false
};

export class SelectState{
    constructor(selects){
        this.options = {
            type:'',
            options:[],
            isLoading:false,
            isFailed:false,
            open:false,
            value:'',
            multiple:false,
            allowEmpty:false
        };
        selects=selects.map(i=>[i[0],Object.assign({},this.options,i[1])]);
        this.selects = new Map(selects);
    }
    getSelects(){
        return this.selects;
    }
    getSelect(key){
        return this.selects.get(key)
    }
    editSomeSelect(keys,objs){
        keys.map((item,i)=>{
            let data = this.getSelect(item);
            if(data){
                this.selects.set(item,Object.assign({},data,objs[i]))
            }
        })
    }
    editSelect(key,obj){
        let data = this.getSelect(key);
        if(obj.open){
            this.editAllSelect({open:false})
        }
        if(data){
            this.selects.set(key,Object.assign({},data,obj))
        }
    }
    editAllSelect(obj){
        [...this.selects.entries()].map(
            i=>this.selects.set(i[0],Object.assign({},i[1],obj)))

    }
    subMap(map){
        this.selects = new Map([...this.selects.entries(),...map.entries()])
    }
}

