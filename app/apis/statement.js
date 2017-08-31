/**
 * Created by 栗子哥哥 on 2016/12/12.
 */
/**
 * 创建于：6/6/16
 * 创建人：杨骐彰
 * 说明：能效信息
 */

import {http} from '../utils'
import Q from 'q'



/**
 * 获取历史用电报表
 * @param sns
 * @param form
 * @param startTime
 * @param endTime
 * @returns {{request, promise}}
 */
/**
 * 获取历史用电报表
 * @param
 * @returns {{request, promise}}
 */
exports.getStatementInfoHistory = function (ids, form, startTime, endTime) {
    return http({
        url: '/EnergyInfo/ReportForm',
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({
            Ids: ids,
            Form: form,
            StartTime: startTime,
            EndTime: endTime
        })
    });
};
/**
 * 导出报表
 * @param
 * @returns {{request, promise}}
 */
exports.exportStatementInfoHistory = function(ids,form,startTime,endTime){
    return http({
        url:'/ReportFormExcel',
        type:'post',
        contentType:'application/json; charset=utf-8',
        data:JSON.stringify({
            Ids:ids,
            Form:form,
            StartTime:startTime,
            EndTime: endTime
        })
    })
};

