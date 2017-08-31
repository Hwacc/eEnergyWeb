/**
 * Created by qizhang on 5/4/16.
 * user info reducer
 */

import {SET_USER_INFO} from '../action'

export default (state = null, action={})=> {
    switch (action.type) {
        case SET_USER_INFO:
            return Object.assign({}, action.data);
        default:
            return state;
    }
}

