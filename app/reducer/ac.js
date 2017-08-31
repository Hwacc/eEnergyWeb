import * as actionType from '../action/actionType';

/*
* ac state: {switch: true, model: 'auto', temp: 26, windSpeed: 'low', windDirection: 'auto'}
 */

export default (state = {}, action = {}) => {
    switch (action.type){
        case actionType.AC_SWITCH:
            return {...state, switch: action.switch};
        case actionType.AC_MODE_CHANGE:
            return {...state, model: action.model};
        case actionType.AC_TEMP_CHANGE:
            return {...state, temp: action.temp};
        case actionType.AC_WIND_SPEED_CHANGE:
            return {...state, windSpeed: action.windSpeed};
        case actionType.AC_WIND_DIRECTION_CHANGE:
            return {...state, windDirection: action.windDirection};
        default :
            return state;
    }
};