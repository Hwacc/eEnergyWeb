/**
 * 创建于：6/3/16
 * 创建人：杨骐彰
 * 说明：基础组件
 */
import React,{Component} from 'react'


export default class BaseComponent extends Component {
    constructor() {
        super(...arguments);

        //web请求集合
        this.requests = [];
    }

    /**
     * 添加一个web请求
     * @param request
     */
    registerRequest(request) {
        if (Array.isArray(request)) {
            this.requests = this.requests.concat(request);
        }
        else {
            this.requests.push(request);
        }
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        //移除时取消所有注册请求
        this.mounted = false;
        this.requests.forEach((request)=> {
            request.abort();
        });
    }
}

