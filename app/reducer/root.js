/**
 * Created by qizhang on 5/4/16.
 * reducers
 */

import {combineReducers} from 'redux'
import userInfo from './userInfo'
import {token, fileToken} from './token'

const appReducer = combineReducers({
    userInfo,
    token,
    fileToken
});

const rootReducer = (state, action) => {
    if (action.type === 'USER_LOGOUT') {
        state = undefined;
    }

    return appReducer(state, action)
};


export default rootReducer;