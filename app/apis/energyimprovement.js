/**
 * Created by 栗子哥哥 on 2017/3/11.
 */
import {http} from '../utils'
import Q from 'q'

/**
 * 获取分组的设备
 * @param sns
 * @returns {{request, promise}}
 */
exports.getEnergyDevice = function (data) {
    return http({
        url: `/EComparison/Devices`,
        type: 'get',
        contentType: 'application/json; charset=utf-8',
        data:data
    });
};


//获取空调信息

exports.getEnergyAirCondition = function (type,data) {
    if(type){
        return http({
            url: `/EComparison/AirCondition?form=${type}`,
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            data:JSON.stringify(data)
        });
    }else {
        return http({
            url: `/EComparison/AirCondition`,
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            data:JSON.stringify(data)
        });
    }

};

//获取小时用能
exports.getEnergyHour = function (devId,data) {
    if(devId){
        return http({
            url: `/EComparison/MultiTimeDayEnergy?devId=${devId}`,
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            data:JSON.stringify(data)
        });
    }else {
        return http({
            url: `/EComparison/MultiTimeDayEnergy`,
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            data:JSON.stringify(data)
        });
    }
};


//获取日用能

exports.getEnergyDay = function (type,data) {
    if(type){
        return http({
            url: `/EComparison/DayEnergy?form=${type}`,
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            data:JSON.stringify(data)
        });
    }else {
        return http({
            url: `/EComparison/DayEnergy`,
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            data:JSON.stringify(data)
        });
    }
};
