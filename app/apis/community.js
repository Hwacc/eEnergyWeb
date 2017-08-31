/**
 * 创建于：6/3/16
 * 创建人：杨骐彰
 * 说明：小区接口
 */
import {http} from '../utils'

/**
 * 获取小区列表
 */
exports.getCommunityList = function (q) {
    let data = {};
    if(q){
        data = {q:q}
    }
    return http({
        url: '/Community',
        data:data
    });
};
/**
 * 添加小区
 */
exports.addCommunity = function(community){

    return http({
        url:'/Community',
        type:'post',
        data:community
    })
}
/**
 * 获取小区管理员列表
 */
exports.getCommunityManagerList = function (id) {
    return http({
        url: '/Community/CommunityUsers',
        data: {
            id: id
        }
    });
};
/**
 * 获取小区详情
 */
exports.getCommunityDetail = function(id){
    return http({
        url:'/Community/'+id,
        type:'get'
    })
};
/**
 * 修改小区信息
 */
exports.putCommunityDetail = function(community){
    return http({
        url:'/Community',
        type:'put',
        data:community
    })
}
/**
 * 获取小区详情
 */
exports.getDetailInfo = function(cid){
    return http({
        url:`/Community/IncludeWeather?id=${cid}`,
        type:'get'
    })
};
