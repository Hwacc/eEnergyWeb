/**
 * Created by whj57 on 2016/12/19.
 */
import React,{Component} from 'react';
import './style.scss'
import classnames from 'classnames'
import Checkbox from '../checkbox'
import moment from 'moment'
import List from '../list'

/**
 * 设备对比组件
 * */

export class DeviceListBar extends Component{
    constructor(){
        super(...arguments);
    }

    toggleCheckState(dId) {
        let deviceList = this.props.data;
        let isSingle = this.props.isSingle || false;
        
        if(isSingle){
             deviceList&&deviceList.map((d,i) => {
                 if(d.DeviceId == dId){
                     deviceList[i].checked = !deviceList[i].checked;
                 }else{
                     d.checked = false;
                 }
                 this.props.onChange(deviceList)
             })
         }else{
             deviceList&&deviceList.some((d,i) => {
                 if(d.DeviceId == dId){
                     deviceList[i].checked = !deviceList[i].checked;
                     return true
                 }
             });
            let chooseDeviceNum = 0;
            deviceList.map((t)=>{
                 if(t.checked){
                     chooseDeviceNum++;
                 }
             })
            if(chooseDeviceNum>6){
                
                deviceList&&deviceList.some((d,i) => {
                    if(d.DeviceId == dId){
                        deviceList[i].checked = !deviceList[i].checked;
                        return true
                    }
                });
                alert('最多选择六个对比设备')
            }else{
                this.props.onChange(deviceList)
            }
         }
        
    }
    
    render(){
        let {style,isLoading} = this.props;
        let deviceList = this.props.data;
        return(
            <div className="check-box-wrapper" style={style}>
                    {deviceList&&deviceList.length>0 && deviceList.map((val,index)=> {
                        if(index%2===0){
                            return(
                                <div key={val.DeviceId} className="check-content">
                                    <div className={val.checked?"check-box-name checked":"check-box-name"}>{val.DeviceNick}</div>
                                    <Checkbox className="check-box" checked={val.checked} onClick={()=>{this.toggleCheckState(val.DeviceId)}}/>
                                </div>
                            );
                        }else if(index%2 !== 0){
                            return(
                                <div key={val.DeviceId} className="check-content" style={{float:'right'}}>
                                    <div className={val.checked?"check-box-name checked":"check-box-name"}>{val.DeviceNick}</div>
                                    <Checkbox className="check-box" checked={val.checked} onClick={()=>{this.toggleCheckState(val.DeviceId)}}/>
                                </div>
                            );

                        }
                    })}
                    {
                        deviceList && deviceList.length === 0 &&
                        <p style={{textAlign:'center',paddingTop:10}}>
                            {isLoading?'正在加载数据':'没有数据'}
                        </p>
                    }
            </div>
        )
    }
}
export default DeviceListBar
