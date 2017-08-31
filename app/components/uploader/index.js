/**
 * Created by whj on 2016/7/1.
 * 说明：上传
 */
import React, {Component} from 'react'
import BaseComponent from 'basecomponent'
import Modal from 'modal'
import Button from 'button'
import {findDOMNode} from 'react-dom'

import './style.scss'

class Uploader extends BaseComponent{
    constructor(props){
        super(...arguments);
        this.state={
            formData:new FormData(),
            files:null,
            fileList:[],
            isSingle:true,
            isChecked:false,
            isLoader:false
        }
    }
    //选择文件处理
    handleChange(e){
        var files =e.target.files;
        this.setState({isChecked:true});
        let {fileList} = this.state;
        let formData = new FormData();
        if(this.isExcel(files[0])){
            if(fileList.length>0){
                fileList.pop()
            }
            fileList.push(files[0]);//以后多个文件上传
            formData.append("file",fileList[0]);
            this.setState({
                fileList:fileList,
                formData:formData
            })
        }else {
            alert('选择的文件格式错误')
        }
    }
    //限定上传文件格式
    isExcel(file){
        if(file.name){
            let name = file.name.split('.');
            return name[1]=='xlsx'
        }
    }
    //点击上传处理
    handleClick(){
        let {isLoader} = this.state;
        if(!isLoader){
            let api = this.props.api;
            let data = this.state.formData;
            this.deviceUploaderRP&&this.deviceUploaderRP.request.abort();
            this.deviceUploaderRP = api(data);
            this.setState({isLoader:true})
            this.deviceUploaderRP.promise
                .then((res)=>{
                    this.props.hideEditModal();
                    alert('导入成功')
                })
                .catch((err)=>{
                    if (!err.abort) {
                        alert(err.msg);
                    }
                })
                .done(()=> {
                    Modal.closeLoading();
                    this.setState({
                        isLoader:false
                    })
                })
        }
    }
    render(){
        let {hideEditModal,files} = this.props;
        let {fileList,isLoader ,isChecked} = this.state;
        return(
            <Modal width="450" show={true} >
                <Modal.Header text="上传列表" onClose={hideEditModal}/>
                <Modal.Content>
                    <div>{isChecked&&(fileList.length>0?fileList[0].name:'请重新选择文件')}</div>
                    <Button className="distanceX" size="thin" style={{position:"relative",width:100,marginTop:20}}>
                        <input type="file" name="test" className="uploader-file" ref="uploader"
                               accept=".xlsx"
                               onChange={this.handleChange.bind(this)}/>
                        选择文件
                    </Button>
                    <Button size="thin" type="outline" className="distanceX" style={{width:100,marginTop:20}}
                            onClick={this.handleClick.bind(this)}>{isLoader?'上传中':'开始上传'}</Button>

                    <div className="text-right" style={{marginTop:40,marginLeft:107}}>
                        <Button size="thin" type="outline" style={{width:100}}
                                onClick={hideEditModal}>关闭
                        </Button>
                    </div>
               </Modal.Content>
            </Modal>
        )
    }
}
module.exports = Uploader;