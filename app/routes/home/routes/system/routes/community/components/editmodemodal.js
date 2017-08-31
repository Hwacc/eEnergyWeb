/**
 * Created by whj on 2016/7/4.
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'redux-components/rmodal'
import Table from 'redux-components/table'
import {Input} from 'redux-components/formcontrol'
import apis from 'apis'
import Button from 'redux-components/button'
import {MySelect,SelectList,SelectState}
    from 'redux-components/dropdownselect'
export default class EditModeModal extends BaseComponent{
    constructor(props){
        super(...arguments);
        this.state={
            isShow:false,
            mode: props.data.Name
        }
    }
    
    componentWillMount(){
        const openAnimation = ()=>this.setState({isShow:true});
        setTimeout(openAnimation,0);
    }
    /**
     * 保存添加更改
     */
    savingEdit() {
        this.groupModeAddRP && this.groupModeAddRP.request.abort();
        let postData = {
            Id: this.props.data.Id,
            Name:this.state.mode,
            FatherGroup: this.props.id
        }
        this.groupModeAddRP = apis.group.editGroupMode(postData);
        this.registerRequest(this.groupModeAddRP.request);
        this.groupModeAddRP.promise
            .then((res)=> {
                
                this.handleClose();
                alert('修改成功')
                this.props.search()
               
            })
            .catch((err)=> {
                if (!err.abort) {
                    alert(err.msg);
                }
            })
    }
    handleClose() {
        this.setState({
            isShow: false
        });
        setTimeout(this.props.hideEditModal,300);
    }
    render(){
        
        const {isShow,mode} = this.state;
        return(
            <Modal width="390" height="200" show={isShow}>
                <Modal.Header text="修改分区方式" align="center" onClose={()=>this.handleClose()}/>
                <Modal.Content>
                    <Table align="left"
                           noborder={true}>
                        <Table.Body>
                            <tr>
                                <td style={{textAlign:'right'}}>分区方式：</td>
                                <td>
                                    <Input style={{width:180}}
                                           size="thin"
                                           block={true}
                                    >
                                        <input
                                            value={mode}
                                            onChange={(e)=>this.setState({mode:e.target.value})}
                                        />
                                    </Input>
                                </td>
                            </tr>

                        </Table.Body>
                    </Table>
                    <p>
                    </p>
                    <div className="text-center">
                        <Button size="thin" type="outline" style={{width:100,marginRight:50}}
                                onClick={()=>this.handleClose()}>取消
                        </Button>
                        <Button size="thin" style={{width:100}} onClick={this.savingEdit.bind(this)}>保存</Button>
                    </div>
                </Modal.Content>

            </Modal>
        )
    }
}