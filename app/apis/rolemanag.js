/**
 * Created by whj on 2016/6/17.
 */
import {http} from '../utils'

exports.roleList = function(q){
    var params = {}
    if(q){
        params.q =q
    }
    return http({
        url:'/Role',
        type:'get',
        contentType: 'application/json; charset=utf-8',
        data:params
    })
};

exports.getRoleDetail = function(id){
    return http({
        url:'/Role/'+id
    })
}