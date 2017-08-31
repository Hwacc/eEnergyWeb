/**
 * Created by whj57 on 2017/1/5.
 */
/**
 * 创建于：6/8/16
 * 创建人：杨骐彰
 * 说明：模态框组件
 */
import React from 'react'
import classnames from 'classnames'
import Button from '../button'
import PreLoader from '../preloader'
import closeImage from './close_icon.png'
import './style.scss'

export const Modal = props=>{
    let {children,className,width,show,onChange,key} = props;
    let classes = classnames('r-sem-modal', className,{
        'modal-show':show
    });
    let style=props.style||{};
    if (width) {
        style.width = width * 1;
       
    }
    return (
        <div
             className={classes} >
            <div style={style}
                 className="sem-modal-body">
                {children}
            </div>
        </div>
    )
};

//头部
Modal.Header = props=>{
    let {text,align,className,onClose,style} = props;
    let classes = classnames('sem-modal-header', className, {
        center: align === 'center'
    });
    return (
        <div
             className={classes}>
            <div className="" style={style}>{text}</div>
            <img className="close" src={closeImage} onClick={onClose}>
            </img>
        </div>
    )
};
let _style = {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    background: '#fff'
};

//内容
Modal.Content = (props)=>{
    let {children,className,isLoading,loadingText,isLoadingFailed,loadingFailedText,style} = props;
    let classes = classnames('sem-modal-content', className);
    return (
        <div style={style}
             className={classes}>
            {children}
            {isLoading && <div style={_style}>
                <PreLoader
                    align={true}
                    show={true}
                    text={loadingText}/>
            </div>}
            {isLoadingFailed && <div style={_style}>
                <div
                    style={{position:'absolute',top:'45%',width:'100%',textAlign:'center'}}>{loadingFailedText}</div>
            </div>}
        </div>
    )
};

Modal.Footer = (props)=>{
    let {align,className,children} = props;
    let classes = classnames('sem-modal-footer', className, {
        'text-left': align === 'left',
        'text-right': align === 'right'
    });
    return (
        <div
             className={classes}>
            {children}
        </div>
    )};

Modal.Alert = (props)=>{
    let {onClose,onConfirm,content,title,closeText,time,show} = props;
    return(
        <Modal width="300" show={show}>
            <Modal.Header align='center' text={title} onClose={onClose}/>
            <Modal.Content>
                <div className="text-center" style={{padding:'13px 0'}}>
                    {content}
                </div>
            </Modal.Content>
            <Modal.Footer>
                <Button size="thin"  style={{width:120}}
                                 onClick={onConfirm}
                >
                    {closeText}<span>({time})</span>
                </Button>
            </Modal.Footer>
        </Modal>
    )
};

export const modalType = {
    "alert":0,
    "confirm":1,
    "loading":2
};

export class AlertManager {
    constructor() {
        this.alertMap = new Map();
        this.key = 0;
        this.options = {
            content: '',
            title: '提示',
            closeText: '确定',
            time:10,
            show:false
        }
    }

    addAlert(obj) {
        !obj.key&&this.key++;
        let key = obj.key||this.key;
        this.alertMap.set(key, Object.assign({key:key},this.options, obj));
    }

    deleteAlert(key) {
        this.alertMap.delete(key)
    }

    getAlert(key){
        return this.alertMap.get(key)
    }

    getAllAlert(){

        return [...this.alertMap.values()]
    }

    editAlert(key,obj){
        let data = this.getAlert(key);
        if(data){
            if(data.hasOwnProperty(key))return;
            this.alertMap.set(key,Object.assign({},data,obj))
        }

    }

    initAlert(params){
        if(Array.isArray(params)){
            params.map(i=>{
                this.addAlert(i)
            })
        }else {
            this.addAlert(params)
        }
    }
}


Modal.Confirm = (props)=>{
    let {show,title,closeText,confirmText,close,onConfirm,buttons,content} = props;
    return(
        <Modal width="300" show={show}>
            <Modal.Header align='center' text={title} onClose={()=>close()}/>
            <Modal.Content>
                <div className="text-center" style={{padding:'13px 0'}}>
                    {content}
                </div>
            </Modal.Content>
            <Modal.Footer>
                <Button size="thin" type="outline" style={{width:100}}
                        onClick={()=>close()}>
                    {closeText}
                </Button>
                <Button size="thin" style={{width:100}}
                        onClick={()=>{
                            close();
                            onConfirm();
                        }}>
                    {confirmText}
                </Button>
                {buttons&&buttons.map((b, i)=> {
                    return (
                        <Button size="thin" style={{width:100}}
                                onClick={()=>{
                                    close();
                                    b.onClick();
                                }}>
                            {b.text}
                        </Button>
                    );
                })}
            </Modal.Footer>
        </Modal>
    )
};

Modal.Loading = (props)=>
    <Modal>
        <div className="text-center" style={{color:'#fff'}}>
            {props.loadingContent || "正在处理，请稍等..."}
        </div>
    </Modal>;
export default Modal