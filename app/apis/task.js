
import {http} from '../utils'

/**
 * 添加任务列表
 */
exports.addTask = function (data) {
    return http({
        type:'post',
        contentType:'application/json; charset=utf-8',
        url: `/TaskManage`,
        data:JSON.stringify(data)
    });
};

/**
 * 获取任务列表
 * @param data
 * @returns {{request, promise}}
 */
exports.getTaskList = function (data) {
    return http({
        type:'get',
        contentType:'application/json; charset=utf-8',
        url: `/TaskManage/TaskList`,
        data:data
    });
};

/**
 * 获取单个任务
 * @param data
 * @returns {{request, promise}}
 */
exports.getSingleTask = function (id) {
    return http({
        type:'get',
        contentType:'application/json; charset=utf-8',
        url: `/TaskManage?id=${id}`
    });
};

/**
 * 获取分组列表
 * @param id
 * @param q
 * @returns {{request, promise}}
 */
exports.modifyTask= function (data) {
    return http({
        type:'put',
        contentType:'application/json; charset=utf-8',
        url: `/TaskManage/ModTask`,
        data:JSON.stringify(data)
    });
};

/**
 * 激活关闭任务
 */
exports.onOffTask = function (id,state) {
    return http({
        type:'put',
        contentType:'application/json; charset=utf-8',
        url: `/TaskManage/OnOffTask?id=${id}&state=${state}`,
    });
};

/**
 * 删除任务
 */
exports.deleteTask = function (id) {
    return http({
        type:'delete',
        url: `/TaskManage/${id}`
    });
};
