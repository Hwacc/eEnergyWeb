/**
 * Created by qizhang on 5/4/16.
 * token reducer
 */

import {SET_TOKEN, SET_FILE_TOKEN} from '../action'

export function token(state = '', action={}) {
    switch (action.type) {
        case SET_TOKEN:
            return action.data;
        default:
            return state;
    }
}

export function fileToken(state = '', action={}) {
    switch (action.type) {
        case SET_FILE_TOKEN:
            return action.data;
        default:
            return state;
    }
}

