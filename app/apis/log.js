/**
 * 创建于：6/6/16
 * 创建人：杨骐彰
 * 说明：能效信息
 */

import {http} from '../utils'
import Q from 'q'



/**
 * 获取操作类型列表
 */
exports.getOperationType = function () {
    return http({
        url: '/LogManage',
        type: 'get'
    });
};

/**
 * 获取日志列表
 */
exports.getLogList = (params,skip,count)=> {

    let baseHttp =  http({
        url:`/LogManage/Logs?skip=${skip}&count=${count}`,
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data:JSON.stringify(params)
    });
    let countHttp = http({
        url:`/LogManage/Logs?count=0`,
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data:JSON.stringify(params)
    });
    return {
        request: [baseHttp.request, countHttp.request],
        promise: Q.all([baseHttp.promise, countHttp.promise])
    }
};

exports.getExceptionList = (params,skip,count)=> {

    let baseHttp =  http({
        url:`/LogManage/Logs/Exception?skip=${skip}&count=${count}`,
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data:JSON.stringify(params)
    });
    let countHttp = http({
        url:`/LogManage/Logs/Exception?count=0`,
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data:JSON.stringify(params)
    });
    return {
        request: [baseHttp.request, countHttp.request],
        promise: Q.all([baseHttp.promise, countHttp.promise])
    }
};
