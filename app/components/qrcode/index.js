/**
 * Created by 栗子哥哥 on 2017/2/20.
 */
import React from 'react'
import qrCode from 'arale-qrcode'
import './style.scss'
import classNames from'classnames'
import BaseComponent from 'basecomponent'


class QRCode extends BaseComponent{
     
     componentDidMount(){
         let props = this.props;
         let baseObj ={
             render: 'canvas',
             correctLevel: 0,
             text: '您好！',
             size: 250,
             background: '#eeeeee',
             foreground: '#000000',
             pdground: '#000000',
             image : '',
             imageSize : 50
         };
         let QRObj = Object.assign({},baseObj,props);
         let qrcodes = new qrCode(QRObj);
         props.dataPass(qrcodes);
         document.getElementById('qrcode').appendChild(qrcodes);
}
     render(){
         const {className,style,size}= this.props;
         let classes = classNames('qrcode',className);
         let _style = style ||{};
         _style.width = size*1;
         _style.height= size*1;
     return(
         <div id='qrcode'
              style={_style}
              className={classes}>
         </div>
     )}
 };

export default QRCode