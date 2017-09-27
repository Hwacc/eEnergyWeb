/**
 * 创建于：2016-5-19
 * 创建人：杨骐彰
 * 说明： checkbox组件
 */
import React from 'react'
import classNames from 'classnames'
import './style.scss'
import Button from '../button'
import icon from '../../icons'
import * as staticType from 'utils/staticType'
import Switch from 'switch'
import store from 'store'

const AirControl =(props)=> {
    const {data,onUpload,onChange,className,switchHandle,createUploadTask,showSwitch} = props;
    // const childData = data;
    let order = data.length || 0;
    let childData;
    if(data.length == 1 && data[0].DeviceStates){
        childData = data[0].DeviceStates
    }else{
        childData = data;
    }
    return (
        <div className="sem-air-control" style={{order:order}}>
{/*        <div className="sem-air-control-title">
                {data.GroupId?data.GroupName:store.get('deviceTypeName')}({data.TotalPower?data.TotalPower:0}kWh)
            </div>*/}
            <div className="sem-air-control-content">
                <div className="cover"></div>
                {
                    childData.length > 0 &&childData.map((t,i)=>{
                        let deviceCapacities = t.DeviceCapacities;
                        let measureType = false,measure={};
                        let switchType= false,sw={};
                        let controlType =false,control={};

                        deviceCapacities&&deviceCapacities.map((m,ii)=>{
                            if(m.Type ==staticType.capacityType.measure) {
                                 measure=m;
                                measureType = true
                            }
                            if(m.Type ==staticType.capacityType.switch) {
                                sw=m;
                                switchType = true;
                            }
                            if(m.Type ==staticType.capacityType.control) {
                                control=m;
                                controlType = true
                            }
                        });
                        let  currentPower = measure.CurrentPower || sw.CurrentPower || control.CurrentPower
                        return(
                            <div >
                                <div className="content">
                                    <div className="header">
                                        <div className="left" style={switchType&&!measureType&&!controlType?{backgroundImage:`url(${icon.areaLight})`}:{backgroundImage:`url(${icon.areaAc})`}}></div>
                                        <div className="middle">{t.Nick}</div>
                                    </div>
                                    {
                                        (controlType&&switchType&&measureType)?
                                            <div className="footer">
                                                <Button type="thin" className="btn little left" order='1'
                                                        onClick={measure.IsOnline >0? ()=>createUploadTask(t.Id) : ()=>alert('设备离线')}>
                                                    {
                                                        t.isLoading ?
                                                            '正在上传'
                                                            :
                                                            (t.isSuccess ? '上传成功' : '上传电量')
                                                    }
                                                </Button>
                                                <Button type="thin" order="2" className="btn little"
                                                        onClick={control.IsOnline>0?()=>onChange(t.Id,t):()=>{alert('设备离线')}}>控制设备</Button>
                                                {/*<Button  type="thin" className="btn little" order="3" onClick={sw.IsOnline>0? ()=>showSwitch(t.Id, sw.PowerOn,sw.Type) : ()=>alert('设备离线')}>控制开关</Button>*/}
                                            </div>
                                            :
                                            <div className="footer">
                                                {
                                                    deviceCapacities&&deviceCapacities.map((m,ii)=>{
                                                        if(m.Type ==staticType.capacityType.measure){
                                                            return(
                                                                <Button type="thin" className="btn" order='1' onClick={m.IsOnline>0?()=>createUploadTask(t.Id):()=>alert('设备离线')}>
                                                                    {
                                                                        t.isLoading?
                                                                            '正在上传'
                                                                            :
                                                                            (t.isSuccess?'上传成功':'上传电量')
                                                                    }
                                                                </Button>
                                                            )
                                                        }
                                                        if(m.Type ==staticType.capacityType.switch){
                                                            return(
                                                                <Switch bigger={true} order="3" status={m.PowerOn?1:0} changeStatus={m.IsOnline>0?()=>switchHandle(t.Id, m.PowerOn,m.Type):()=>alert('设备离线')}/>
                                                            )
                                                        }
                                                        if(m.Type ==staticType.capacityType.control){
                                                            return(
                                                                <Button type="thin" order="2" className="btn left" onClick={m.IsOnline>0? ()=>onChange(t.Id,t) : ()=>alert('设备离线')}>控制设备</Button>
                                                            )
                                                        }
                                                    })
                                                }
                                            </div>
                                    }
                                    <div className="body">用电量：{currentPower?currentPower.toFixed(2):0}
                                        kWh
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            
            
        </div>
    )
};

AirControl.propTypes = {
    checked: React.PropTypes.bool
};

export default AirControl;
