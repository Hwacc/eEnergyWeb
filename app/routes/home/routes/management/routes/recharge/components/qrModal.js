/**
 * Created by 栗子哥哥 on 2017/2/21.
 */
/**
 * Created by whj on 2016/7/2.
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'redux-components/rmodal'
import PreLoader from 'redux-components/preloader'
import Table from 'redux-components/table'
import apis from 'apis'
import Button from 'redux-components/button'
import QRCode from 'components/qrcode'
import $ from 'jquery'
export default class QRModal extends BaseComponent{
    constructor(props){
        super(...arguments);
        this.state={
            isSave:false,
            isShow:false,
            isLoadingQRCode:false,
            url:null
            
        }
    }

    handleClose() {
        this.setState({
            isShow: false
        });
        setTimeout(this.props.hideEditModal,300);
    }
    saveQRCode(e){
        let canvas = e;
        let type = 'png';
        let imgData = canvas.toDataURL(type)
        this.setState({url:imgData})
    }
    search(){
        const {currentId} = this.props;
        this.qrcodeRP&&this.qrcodeRP.request.abort();
        this.qrcodeRP = apis.device.deviceQRCode(currentId.Id);
        this.registerRequest(this.qrcodeRP.request);
        this.qrcodeRP.promise
            .then((res)=> {
           this.setState({
               isLoadingQRCode:true,
               QRCodeText: res.Data
           });
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                }
            })
    }
    componentWillMount(){
        const openAnimation = ()=>this.setState({isShow:true});
        setTimeout(openAnimation,0);
    }
    componentDidMount(){
        this.search();
    }

    render(){
        const {isShow,QRCodeText,isLoadingQRCode,url} = this.state;
        const {currentId} = this.props;
        let title = currentId.Nick +'二维码' || '二维码';
        return(
            <Modal width="380" show={isShow}>
                <Modal.Header text={title} style={{color:'#ffffff',fontSize: 14,backgroundColor:'#52caff'}} align="center" onClose={()=>{this.handleClose()}}/>
                <Modal.Content>
                    {isLoadingQRCode&& <QRCode text={QRCodeText}
                                               size="230"
                                               background="#ffffff"
                                               dataPass={(e)=>this.saveQRCode(e)}
                    >
                    </QRCode>}
                    <div className="text-center">
                      <a href ={url} download={title+'.png'}
                         style={{display:'inline-flex',
                         height: 32,
                         width: 100,
                         backgroundColor:'#52caff',
                         alignItems:'center',
                         justifyContent:'center',
                         borderRadius:4,
                         color:'#ffffff',
                         marginTop: 13,
                         marginBottom:20
                         }}
                      >保存到电脑</a>
                    </div>
                </Modal.Content>
            </Modal>
        )
    }
}