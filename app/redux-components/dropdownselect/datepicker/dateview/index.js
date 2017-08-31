/**
 * 创建于：6/6/16
 * 创建人：qizhang
 * 说明：
 */
import React from 'react'
import classnames from 'classnames'

const dateView = (props)=>{
    let {year,month,value,onMonthChange,onOpenMonthView,onValueChange,autoClose,date} = props;
    value = new Date(value)

    let _cloneDate = function (d) {
        return new Date(d.getTime());
    }
    let beginDate = new Date(year, month - 1, 1);
    let endDate = new Date(new Date(_cloneDate(beginDate).setMonth(_cloneDate(beginDate).getMonth() + 1)).setDate(0))
    let thisMonthDays = endDate.getDate() - beginDate.getDate() + 1
    var days = []
    let theDay = thisMonthDays + 1,theMonth,theYear
    if(date){
        if(date === 'default'){
            theDay = new Date().getDate()
            theMonth = new Date().getMonth()
            theYear = new Date().getFullYear()
        } else {
            theDay = new Date(date).getDate()
            theMonth = new Date(date).getMonth()
            theYear = new Date(date).getFullYear()
        }
    }
    for (let i = 1; i <= thisMonthDays; i++) {

        if(new Date(year,month-1,i) >= new Date(theYear,theMonth,theDay)){
            days.push({
                text: i,
                val: new Date(year, month - 1, i).getTime(),
                fade:true
            })
        }else {
            days.push({
                text: i,
                val: new Date(year, month - 1, i).getTime()
            })
        }
    }
    let lastMonthEndDate = new Date(_cloneDate(beginDate).setDate(0));
    for (let i =0, l = lastMonthEndDate.getDate(), j = beginDate.getDay(); i < j; i++) {
        days.unshift({
            text: l - i,
            val: new Date(year, month - 2, i).getTime(),
            fade: true
        });

    }
    for (let i = 1, j = endDate.getDay() + 1; j <= 6; j++, i++) {
        days.push({
            text: i,
            val: new Date(year, month, i).getTime(),
            fade: true
        });
    }
    return (
        <div className="datepicker-drop-view" onClick={(e)=>e.stopPropagation()}>

            <div className="switcher">
                    <span className="s-pre" onClick={(e)=>{onMonthChange(month - 1)}}>
                        &lt;
                    </span>
                <span className="show-value" onClick={(e)=>{onOpenMonthView()}}>{year}年{month}月</span>
                <span className="s-next" onClick={(e)=>{onMonthChange(month + 1)}}>
                        &gt;
                    </span>
            </div>
            <div className="weekend">
                <span>日</span>
                <span>一</span>
                <span>二</span>
                <span>三</span>
                <span>四</span>
                <span>五</span>
                <span>六</span>

            </div>
            {days.map((d)=> {
                let date = new Date(d.val);
                let isToday = false;
                if (value
                    && value.getFullYear
                    && date.getFullYear() === value.getFullYear()
                    && date.getMonth() === value.getMonth()
                    && date.getDate() === value.getDate()) {
                    isToday = true;
                }
                return (
                    <span key={d.val}
                          onClick={()=>{!d.fade&&onValueChange(new Date(d.val),autoClose)}}
                          className={classnames('day-item',{'fade':d.fade,'active':isToday})}>
                            <span>{d.text}</span>
                        </span>
                )
            })}
        </div>
    )
}

export default dateView

