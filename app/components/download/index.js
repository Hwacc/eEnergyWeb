/**
 * Created by whj on 2016/6/30.
 */
import React from 'react'
import BaseComponent from '../basecomponent'
import appConfig from '../../config'
class DownLoad extends BaseComponent{
    constructor(){
        super(...arguments)

    }
    componentDidMount(){
        let form = this.refs.form;
        form.submit()
    }
    render(){
        let {src,method,data} = this.props;
        let inputList = [];
        for(var key in data){

            let obj = {
                name:key,
                value:data[key]
            }
            if(Array.isArray(data[key])){
                obj.value = obj.value.join('|')
            }
            inputList.push(obj)
        }
        return(
            <iframe id="down-file-iframe"  style={{display:"none"}}>
                <form target="down-file-iframe" src={appConfig.apiHost+src} method={method} ref='form'
                action={appConfig.apiHost+src}>
                    {
                        inputList.map((i,key)=>{
                            return(<input type="hidden" key={key} name={i.name} value={i.value}/>)
                        })
                    }
                </form>
            </iframe>
        )
    }
}
module.exports = DownLoad