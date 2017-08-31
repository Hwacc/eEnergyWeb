/**
 * 创建于：6/6/16
 * 创建人：杨骐彰
 * 说明：能效信息
 */

import {http} from '../utils'
import Q from 'q'

/**
 * 获取今日用电信息
 * @param sns
 * @returns {{request, promise}}
 */
exports.getEnergyInfoToday = function (sns) {
    return http({
        url: '/EnergyInfo/Today',
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({
            Sns: sns
        })
    });
};
/**
 * 获取今日用电明细
 */
exports.getEnergyInfoTodayDetail = function(sns){
    return http({
        url:'/EnergyInfo/TodayDetail',
        type:'post',
        contentType:'application/json; charset=utf-8',
        data:JSON.stringify({
            Sns: sns
        })
    });

};

/**
 * 获取历史用电信息
 * @param sns
 * @param form
 * @param startTime
 * @param endTime
 * @returns {{request, promise}}
 */
/**
 * 获取历史用电信息
 * @param 
 * @returns {{request, promise}}
 */
exports.getEnergyInfoHistory = function (sns, form, startTime, endTime) {
    return http({
        url: '/EnergyInfo/History',
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({
            Ids: sns,
            Form: form,
            StartTime: startTime,
            EndTime: endTime
        })
    });
};
/**
 * 获取历史用电明细
 * @param 
 * @returns {{request, promise}}
 */
exports.getEnergyDetailHistory = function(sns,form,startTime,endTime){
    return http({
        url:'/EnergyInfo/HistoryDetail',
        type:'post',
        contentType:'application/json; charset=utf-8',
        data:JSON.stringify({
            Sns:sns,
            Form:form,
            StartTime:startTime,
            EndTime: endTime
        })
    })
};
/**
 *获取劣势用电明细分页
 *
 */
exports.getEnergyDetailHistoryWithRange = function(sns,form,startTime,endTime,skip,count){
    let params ={
        Sns:sns,
        Form:form,
        StartTime:startTime,
        EndTime: endTime
    };
    let baseHttp = http({
        url:'/EnergyInfo/HistoryDetail',
        type:'post',
        contentType:'application/json; charset=utf-8',
        data:Object.assign({},params,{skip:skip,count:count})
    });
    let countHttp = http({
        url:'/EnergyInfo/HistoryDetail',
        type:'post',
        contentType:'application/json; charset=utf-8',
        data:Object.assign({},params,{count:0})
    });
    return {
        request: [baseHttp.request, countHttp.request],
        promise: Q.all([baseHttp.promise, countHttp.promise])
    }
};
/**
 * 获取温度和用电明细
 */
exports.getEnergyDetailWithT = function(startTime,endTime,cid){
    let url = '/EnergyInfo/TempImpact?'+'start='+startTime+'&end='+endTime
        +'&cid='+cid;
    return http({
        url:url,
        type:'get',
        contentType:'application/json; charset=utf-8',
    })
};
/**
 * 获取日温度
 */
exports.getEnergyDayWeather = (params)=>http({
        type:'post',
        url:'/Weather',
        data:JSON.stringify(params),
        contentType: 'application/json; charset=utf-8'
    });
/**
 * 获取周末用电信息
 */
exports.getEnergyWeekendDetail = function(startTime,endTime,cid){
    let url = `/EnergyInfo/WeekendDetail?start=${startTime}&end=${endTime}&cid=${cid}`
    return http({
        url:url,
        type:'get',
        contentType:'application/json; charset=utf-8',
    })
};
/**
 * 获取加班用电信息
 */
exports.getEnergyInfoOverTimeSum = function(data){
    let url = '/EnergyInfo/OverTimeSum';
    return http({
        url:url,
        type:'post',
        contentType:'application/json; charset=utf-8',
        data:JSON.stringify(data)
    })
};
/**
 * 获取小区或设备24小时用电统计
 */
exports.getDevicesCompareStatistics = function(data){
    let url = '/EnergyInfo/DevicesCompare';
    return http({
        url:url,
        type:'POST',
        data:data,
    })
};
/**
 *获取小区总用电量
 */
exports.getCommunityEnergy = function(cid,start,end){
    let url = `/EnergyInfo/PowerByCommunity?cid=${cid}&start=${start}&end=${end}`
    return http({
        url:url,
        type:'get'
    })
}
/****************新的接口****************/
/**
 * 获取分组用电总量
 */
exports.getMultiTotal = params=>{
    return http({
        type:'post',
        url:'/EnergyInfo/Group/MultiTotal',
        data:JSON.stringify(params),
        contentType: 'application/json; charset=utf-8',
    })
};
/*
* 获取分项用电总量
* */
exports.getUseMultiTotal = params=>{
    return http({
        type:'post',
        url:'/EnergyInfo/Use/MultiTotal',
        data:JSON.stringify(params),
        contentType: 'application/json; charset=utf-8',
    })
};
/**
 * 获取分组用电明细
 */
exports.getGroupDetail = params=>http({
    type:'post',
    url:'/EnergyInfo/Group/Detail',
    data:JSON.stringify(params),
    contentType: 'application/json; charset=utf-8',
});
/**
 * 获取分组子分组用电排行
 */
exports.getChildRank = (params)=>http({
    type:'post',
    url:'/EnergyInfo/Group/ChildRank',
    data:JSON.stringify(params),
    contentType: 'application/json; charset=utf-8'
});
/**
 * 获取分项用电明
 */
exports.getUseDetail = params=>http({
    type:'post',
    url:'/EnergyInfo/Use/Detail',
    data:JSON.stringify(params),
    contentType: 'application/json; charset=utf-8',
});
/**
 * 获取所有分项用电总量
 */
exports.getAllType = params=>http({
    type:'post',
    url:'/EnergyInfo/Use/AllType',
    data:JSON.stringify(params),
    contentType: 'application/json; charset=utf-8',
});
/**
 * 获取报表信息
 */
exports.getReportForm = params=>http({
    type:'post',
    url:'/EnergyInfo/ReportForm',
    data:JSON.stringify(params),
    contentType: 'application/json; charset=utf-8',
});
/**
 * 获取天气对用电量的影响
 * */
exports.getTempImpact = (start,end,cid)=>http({
    type:'get',
    url:`/EnergyInfo/TempImpact?start=${start}&end=${end}&cid=${cid}`
});
/**
 * 获取周末用电信息
 */
exports.getWeekendDetail = (start,end,cid)=>http({
    type:'get',
    url:`/EnergyInfo/WeekendDetail?start=${start}&end=${end}&cid=${cid}`
});
/**
 * 获取加班用电信息
 */
exports.getOverTimeSum = params => http({
    type:'post',
    url:'/EnergyInfo/OverTimeSum',
    data:JSON.stringify(params),
    contentType: 'application/json; charset=utf-8',
});
/**
 * 获取设备用电排行
 */
exports.getRankings = (data) =>http({
    type:'post',
    url:`/EnergyInfo/Rankings`,
    data:data
});
/**
 * 获取小区或设备24小时用电统计
 */
exports.getDevicesCompare = params=>http({
    type:'post',
    url:'/EnergyInfo/DevicesCompare',
    data:JSON.stringify(params),
    contentType: 'application/json; charset=utf-8',
});

/**
 * 获取用电趋势
 */
exports.getTrend = params=>http({
    type:'post',
    url:'/EnergyInfo/Group/Trend',
    data:JSON.stringify(params),
    contentType: 'application/json; charset=utf-8',
});
/**
 * 获取用电排行
 * */
exports.getEnergyRank = (mode,data)=>http({
    type:'post',
    url:`/EnergyInfo/EnergyRank?mode=${mode}`,
    data:JSON.stringify(data),
    contentType: 'application/json; charset=utf-8'
})

/**
 * 获取用途列表
 * */
exports.getUseList = (data)=>http({
    type:'get',
    url:`/EnergyInfo/UseList?gid=${data}`,
    contentType: 'application/json; charset=utf-8'
})

/**
 * 获取节电详情
 * */
exports.getEnergySavingDetail= (data)=>http({
    type:'post',
    url:`/ESaving/DevDetail`,
    data:JSON.stringify(data),
    contentType: 'application/json; charset=utf-8'
})



/**
 * 获取节电详情
 * */
exports.getEnergySavingFeet= (data)=>http({
    type:'post',
    url:`/ESaving/SavingFeet`,
    data:JSON.stringify(data),
    contentType: 'application/json; charset=utf-8'
})

