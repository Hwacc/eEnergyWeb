/**
 * Created by whj57 on 2016/12/19.
 */
import React,{Component} from 'react';
import './style.scss'
import classnames from 'classnames'
import Checkbox from '../checkbox'
import moment from 'moment'

/**
 * 设备对比组件
 * */

export class ChooseBar extends Component{
    constructor(){
        super(...arguments);
    }

    toggleCheckState(dId) {
        let data = this.props.data;
        data&&data.some((d,i) => {
            if(d.DeviceId == dId || d.Id ==dId){
                data[i].checked = !data[i].checked;
                return true
            }
        })
        this.props.onChange(data)
    }
    render(){
        let {style,isLoading,modal} = this.props;
        let data = this.props.data;
        let deviceList = [];
        data.length&&data.map((t)=>{
            if(t.checked){
                deviceList.push(t)
            }
        })
        
        return(
            <div className="bar-wrapper" style={style}>
                
                {modal?
                    <div className="equipment">
                        {
                            deviceList.length?
                                <div className="equipment-right modal" >
                                    {
                                        !isLoading && deviceList.map((t, i)=> {
                                            return (
                                                <div className={t.IsValid?"equipment-content modal":"equipment-content modal valid"} key={i} >
                                                    <div className="equipment-content-width modal" >
                                                        {t.DeviceNick || t.Nick}
                                                    </div>
                                          <span className="delete" onClick={()=>this.toggleCheckState(t.DeviceId || t.Id)}>
                                          </span>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                :<div className="no-device"></div>
                        }
                    </div>
                    :
                    <div className="equipment">
                        <div className="equipment-left">对比设备列表</div>
                        {
                            deviceList.length?
                                <div className="equipment-right">
                                    <div className="cover"></div>
                                    {
                                        !isLoading && deviceList.map((t, i)=> {
                                            return (
                                                <div className="equipment-content" key={i}>
                                                    <div className="equipment-content-width">
                                                        {t.DeviceNick ||t.Name}
                                                    </div>
                                          <span className="delete" onClick={()=>this.toggleCheckState(t.DeviceId ||t.Id)}>
                                          </span>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                :<div className="no-device">无对比设备</div>
                        }
                    </div>
                }

                <div className="bar-child">
                    {this.props.children}
                </div>
            </div>
        )
    }
}
export default ChooseBar
