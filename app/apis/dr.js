/**
 * Created by dell on 2016/9/12.
 */
'use strict';
//dr(Demand Response)

import {http} from '../utils';

exports.addRD = function (rdInfo){
    return http({
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        url: '/Demand',
        data: JSON.stringify(rdInfo)
    });
}

function deleteRD(rdId){}

function editRD(rdId){}

exports.getRDs = function (startTime, endTime){
    let request = {
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        url: '/Demand/AllDemands'
    };

    //data validate
    if(startTime !== 'undefined'){

    }

    request.data = JSON.stringify({
        Start: startTime,
        End: endTime
    });

    return http(request);
}

exports.getRD = function (rdId){
    return http({
        url: '/Demand/' + rdId
    });
}

exports.getDevicesResult = function (rdId) {
    return http({
        url: '/Demand/DeviceResponse?id=' + rdId
    });
}

exports.getStatResult = function (rdId) {
    return http({
        url: '/Demand/Result?id=' + rdId
    });
}

exports.getResults = function (startTime, endTime) {
    return http({
        url: `/Demand/Result?Start=${startTime.toISOString()}&End=${endTime.toISOString()}`
    });
}