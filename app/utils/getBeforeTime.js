/**
 * Created by Hakim on 2017/3/1.
 */
import moment from 'moment'
const getBeforeTime = (time, type, step) => {
    let year = new Date(time).getFullYear(),
        month = new Date(time).getMonth(),
        day = new Date(time).getDate()
    let beforeTime = moment(time).add(type,step).format()
}
