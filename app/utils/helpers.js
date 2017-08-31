/**
 * Created by qizhang on 5/4/16.
 * 帮助函数
 */
import appConfig from '../config'


/**
 * 获取服务器接口地址
 * @param url
 * @returns {string}
 */
export var getApiFullAddress = function (url) {
    if (url[0] !== '/') {
        url = '/' + url;
    }

    return appConfig.apiHost + url;
};

/**
 * 获取权限验证头对象
 * @param token
 * @returns {*}
 */
export var getAuthorizeObj = function (token) {
    return {
        Authorization: `HAuth ${token}`
    };
};

/**
 * 根据资源类型和值获取文本
 * @param type
 * @param value
 * @returns {*}
 */
export var getStaticValueText = function (type, value) {
    let values = appConfig[type];
    if (Object.prototype.toString.call(values) === '[object Array]') {
        for (let i = 0, l = values.length; i < l; i++) {
            if (values[i].value == value) {
                return values[i].text;
            }
        }
        return 'unknown';
    }
    else {
        return values[value];
    }
};


export default {
    getApiFullAddress,
    getAuthorizeObj,
    getStaticValueText
}
