/**
 * 创建于：2016-5-11
 * 创建人：杨骐彰
 * 说明： 根路由
 */

import React,{Component} from 'react'
import $ from 'jquery'
import {Modal,AlertManager,modalType} from 'redux-components/rmodal'
class App extends Component {
    constructor(){
        super(...arguments);
        this.alertManager = new AlertManager();
        this.state = {
            alerts:this.alertManager.getAllAlert()
        }
    }

    componentDidUpdate(){
        let alerts = this.state.alerts;
        if(alerts.length>0){
            alerts.map(i=>{
                if(!i.show){
                    let $Modal = $(this.refs[i.key]);
                    $Modal.find('.r-sem-modal').height();
                    $Modal.find('.r-sem-modal').addClass('modal-show');
                    this.alertManager.editAlert(i.key,{show:true})
                }
            });
           /* this.t = setTimeout(()=>{
                alerts.map(i=>{
                    if(i.time>1){
                        this.alertManager.editAlert(i.key,{time:i.time-1})
                    }else {
                        this.alertManager.deleteAlert(i.key)
                    }
                });
                this.setState({
                    alerts:this.alertManager.getAllAlert()
                })
            },1000)*/
        }
    }

    componentWillUnmount(){
        this.t&&clearTimeout(this.t)
    }

    componentWillMount(){
        window.alert = (content)=>{
            this.alertManager.addAlert({content:content,type:modalType['alert']});
            this.setState({
                alerts:this.alertManager.getAllAlert()
            })
        };
        window.confirm = (options)=>{
            this.alertManager.addAlert(Object.assign({},options,{type:modalType['confirm']}))
            this.setState({
                alerts:this.alertManager.getAllAlert()
            })
        };
        window.modalLoading = (options)=>{
            this.alertManager.addAlert(Object.assign({},options,{type:modalType['loading']}))
            this.setState({
                alerts:this.alertManager.getAllAlert()
            })
        };
        window.closeLoading = (key)=>{
            this.alertManager.deleteAlert(key);
            this.setState({
                alerts:this.alertManager.getAllAlert()
            })
        }

    }

    onConfirmCallBack(){}
    onCloseCallBack(){}

    render() {
        this.props;
        return <div>
            {this.props.children}
            {
                this.state.alerts.map(i=>
                    <div ref={i.key} key={i.key}>
                        {i.type === modalType['alert']&&
                        <Modal.Alert  {...i}
                                      onConfirm={()=>{
                                          this.onConfirmCallBack();
                                          this.alertManager.deleteAlert(i.key);
                                          this.setState({
                                              alerts:this.alertManager.getAllAlert()
                                          })
                                      }}
                                      onClose={
                                          ()=>{
                                              this.onCloseCallBack();
                                              this.alertManager.deleteAlert(i.key);
                                              this.setState({
                                                  alerts:this.alertManager.getAllAlert()
                                              })
                                          }
                                      }
                        />
                        }
                        {
                            i.type === modalType['confirm']&&
                                <Modal.Confirm {...i}
                                close={()=>{
                                    this.alertManager.deleteAlert(i.key);
                                    this.setState({
                                        alerts:this.alertManager.getAllAlert()
                                    })
                                }}/>
                        }
                        {
                            i.type === modalType['loading']&&
                                <Modal.Loading {...i}/>
                        }
                    </div> )
            }
        </div>
    }
}

module.exports = App;
