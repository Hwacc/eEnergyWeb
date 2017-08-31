/**
 * Created by whj on 2016/6/30.
 */
import {http} from '../utils'
import Q from 'q'

exports.exportDevice = function(){
    return http({
        url:'/DeviceExcel',
        type:'get'
    })
}

exports.uploaderDevice = function(data){
    return http({
        url:"/DeviceExcel",
        type:'post',
        data: data,
        processData:false,
        contentType:false
    })
};

exports.reportForm  = (params) =>http(
    {
        type:'post',
        url:'/ReportFormExcel',
        data:JSON.stringify(params),
        contentType: 'application/json; charset=utf-8',
    }
)
