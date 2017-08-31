/**
 * Created by whj on 2016/6/27.
 * 单设备控制
 */
import React,{Component} from  'react'
import BaseComponent from 'basecomponent'
import Modal from 'modal'
import Table from 'table'
import apis from 'apis'
import Button from 'button'
import Switch from 'switch'
import Panel from 'settingpanel'
import * as staticType from 'utils/staticType'

export default class SwitchControlModal extends BaseComponent{
    constructor(props){
        super(...arguments);
    }
    
    render(){
        
        const {hideEditModal,switchHandle,ids,status,type} = this.props;
        return(
            <Modal width="620" show={true} >
                <Modal.Header text = "远程控制" onClose={hideEditModal}/>
                <Modal.Content >
                    <Table align="left"
                           noborder = {true}
                           >
                        <Table.Body>
                            <tr>
                                <td style={{width:80}}>电源开关</td>
                                <td> </td>
                                <td> </td>
                                <td> </td>
                                <td> </td>
                                <td> </td>
                                <td><Switch status={status?1:0} changeStatus={()=>switchHandle(ids,status,type)}/></td>
                            </tr>
                        </Table.Body>
                        </Table>
                </Modal.Content>
            </Modal>
        )

    }
}
