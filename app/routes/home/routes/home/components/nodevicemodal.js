/**
 * Created by 栗子哥哥 on 2017/3/6.
 */
/**
 * Created by Hakim on 2017/2/9.
 */
import React,{Component} from  'react'
import BaseComponent from 'basecomponent'
import Modal from 'redux-components/rmodal'
import Table from 'redux-components/table'
import Button from 'redux-components/button'

export default class NoDeviceModal extends BaseComponent{
    constructor(props){
        super(...arguments);
        this.state={
            isShow:false
        }
    }
  
    componentWillMount(){
        const openAnimation = ()=>this.setState({isShow:true});
        setTimeout(openAnimation,0);
    }
    //保存
   
    handleClose(){
        this.setState({
            isShow:false
        })
        setTimeout(this.props.hideNoDeviceModal,300)
    }
    render(){
        let {isShow} = this.state;

        return(
            <Modal  show={isShow} >
                <Modal.Header onClose={()=>{this.handleClose()}}/>
                <Modal.Content >
                    <Table noborder = {true}
                    >
                        <Table.Body>
                            <tr>
                                <td style={{width:80,fontSize:16}}>无设备</td>
                            </tr>
                        </Table.Body>
                    </Table>
                    <div  style={{marginTop:40,textAlign:'center'}}>
                        <Button size="thin" style={{width:80}} onClick={()=>{this.handleClose()}}>确定
                        </Button>
                    </div>
                </Modal.Content>

            </Modal>
        )
    }

}