/**
 * Created by qizhang on 5/4/16.
 * redux actions
 */
import * as actionType from './actionType';


function makeActionCreator(type, ...argNames){
    return function(...args){
        let action = { type };
        argNames.forEach((arg, index) => {
            action[argNames[index]] = args[index];
        });

        return action;
    }
}

export const changeACTemp = makeActionCreator(actionType.AC_TEMP_CHANGE, 'temp');
export const changeACModel = makeActionCreator(actionType.AC_MODE_CHANGE, 'model');
export const changeACWindSpeed = makeActionCreator(actionType.AC_WIND_SPEED_CHANGE, 'windSpeed');
export const changeACWindDirection = makeActionCreator(actionType.AC_WIND_DIRECTION_CHANGE, 'windDirection');

export const USER_LOGOUT = 'USER_LOGOUT';
export const SET_USER_INFO = 'SET_USER_INFO';
export const SET_USER_ROLE_RESOURCE = 'SET_USER_ROLE_RESOURCE';
export const SET_TOKEN = 'SET_TOKEN';
export const SET_FILE_TOKEN = 'SET_FILE_TOKEN';

/**
 * action 用户退出登录
 * @param data
 */
export function userLogout(data) {
    return {
        type: USER_LOGOUT
    }
}

/**
 * action 设置用户信息
 * @param data
 * @returns {{type: string, data: *}}
 */
export function setUserInfo(data) {
    return {
        type: SET_USER_INFO,
        data: data
    }
}

/**
 * action 设置用户角色资源
 * @param data
 * @returns {{type: string, data: *}}
 */
export function setUserRolResource(data) {
    return {
        type: SET_USER_ROLE_RESOURCE,
        data: data
    }
}

/**
 * action 设置token
 * @param data
 * @returns {{type: string, data: *}}
 */
export function setToken(data) {
    return {
        type: SET_TOKEN,
        data: data
    }
}

/**
 * action 设置fileToken
 * @param data
 * @returns {{type: string, data: *}}
 */
export function setFileToken(data) {
    return {
        type: SET_FILE_TOKEN,
        data: data
    }
}
