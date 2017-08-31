/**
 * Created by whj on 2016/7/2.
 */
import {http} from '../utils'
import Q from 'q'
exports.getProvince= function(){
    return http({
        url:'/Area/Province',
        type:'get'
    })
};

exports.getCity = function(id){
    let url = '/Area/City';
    if(id){
        url = url+'/'+id
    }
    return http({
        url:url,
        type:'get',
    })
};

exports.getDistrict = function(id){
    let url = '/Area/District';
    if(id){
        url = url+'/'+id
    }
    return http({
        url:url,
        type:'get',
    })
};
exports.getCommunity = function(pid,cid,did,q){
    return http({
        url:'/Community',
        type:'get',
        data:{
            pid:pid,
            cid:cid,
            did:did,
            q:q
        }
    })

};