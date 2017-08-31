/**
 * 创建于：6/8/16
 * 创建人：杨骐彰
 * 说明：设备接口
 */
import {http} from '../utils'
import Q from 'q'

/**
 * 获取设备列表
 * @param typeId
 * @param usertype
 * @param gid
 * @param name
 * @returns {{request, promise}}
 */
exports.getDeviceList = function ( usetype, gid, name,ctype ) {
    if(ctype ==0){
        return http({
            url: '/Device',
            data: {
                usetype: usetype || '',
                gid: gid || '',
                name:name||'',
                ctype: 0

            }
        });
    }else{
        return http({
            url: '/Device',
            data: {
                usetype: usetype || '',
                gid: gid || '',
                name:name||'',
                ctype:ctype==0?0:ctype || ''

            }
        });
    }

};

/**
 * 获取设备列表分页
 * @param typeId
 * @param usertype
 * @param gid
 * @param name
 * @param skip
 * @param count
 * @returns {{request, promise}}
 */
exports.getDeviceListWithRange = function (skip, count, typeId, usertype, gid, name, roomFlag) {
    let param = {
        typeId: typeId || '',
        usertype: usertype || '',
        gid: gid || '',
        name:name||'',
        roomFlag: roomFlag ||''
    };

    let baseHttp = http({
        url: '/Device',
        data: Object.assign({}, param, {skip: skip, count: count})
    });

    let countHttp = http({
        url: '/Device',
        data: Object.assign({}, param, {count: 0})

    });

    return {
        request: [baseHttp.request, countHttp.request],
        promise: Q.all([baseHttp.promise, countHttp.promise])
    }
};

/**
 * 获取设备详情
 * @param id
 */
exports.getDeviceDetailInfo = function (id) {
    return http({
        url: `/Device/${id}`
    });
};


/**
 * 修改设备详情
 * @param data
 */
exports.saveDeviceInfoChange = function (id, data) {
    return http({
        type: 'put',
        url: `/Device?id=${id}`,
        contentType: 'application/json;utf-8',
        data: JSON.stringify(data)
    });
};

/**
 * 批量控制设备
 */
exports.controlDevice = function(data){
    return http ({
        type: 'post',
        url :'/Device',
        contentType :'application/json;uft-8',
        data:JSON.stringify(data)
    });
};
/**
 * 解绑设备
 */
exports.unbindDevice = function(data){
    return http({
        type:'put',
        url:'/Device/UnBind',
        contentType: 'application/json;uft-8',
        data:JSON.stringify(data)
    });
};
/**
 * 获取设备用电排行
 */
exports.deviceOrder = function(communityId,startTime,endTime){
    return http({
        type:'get',
        url:`/energyInfo/Rankings?id=${communityId}&start=${startTime}&end=${endTime}`,
    });
};
/**
 * 获取设备状态
 */
exports.deviceStatus = (data)=>http({
    type:'get',
    url:`/Device/State`,
    data:data
});
exports.deviceStatus2 = (usetype,gid,name)=>http(
    {
        type:'get',
        url:`/Device/State?usetype=${usetype}&gid=${gid}&name=${name}`
    }
)

exports.deviceRoomState = (usetype,gid,name)=>http({
    type:'get',
    url:`/Device/RoomState?usetype=${usetype}&gid=${gid}&name=${name}`
});


/**
 * 获取设备二维码
 */
exports.deviceQRCode = function(id,dms){
    let DMS = dms || 1440;
    return http({
        type:'get',
        url:`/Device/QRCode?id=${id}&dms=${DMS}`
        
    })
}
/**
 * 获取设备离线日志
 */
exports.OnOffline = (data) => http({
    type:'post',
    url:`/EnergyInfo/OnOfflineLog`,
    data:data
})
/**
 * 创建上传电量任务
 */
exports.UploadTask = (dId) => http({
    type:'get',
    url:`/Device/Upload/Task?id=${dId}`
})
/**
 *等待上传电量任务结果
 */
exports.WaitResult = (tId) => http({
    type:'get',
    url:`/Device/Upload/WaitResult?id=${tId}`
})
