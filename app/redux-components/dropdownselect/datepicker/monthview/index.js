/**
 * 创建于：6/6/16
 * 创建人：qizhang
 * 说明：
 */
import React from 'react'
import classnames from 'classnames'
const MonthView = (props)=>{
    let {year,value,onYearChange,onMonthChange,onOpenYearView} = props;
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    return (
        <div className="datepicker-drop-view" onClick={(e)=>e.stopPropagation()}>
            <div className="switcher">
                    <span className="s-pre" onClick={()=>onYearChange(year - 1,true)}>
                        &lt;
                    </span>
                <span className="show-value" onClick={()=>onOpenYearView()}>{year}年</span>
                <span className="s-next" onClick={()=>onYearChange(year + 1,true)}>
                        &gt;
                    </span>
            </div>
            {arr.map((d)=> {
                let isActive = false;
                if (value
                    && value.getFullYear
                    && value.getFullYear() === year
                    && value.getMonth() + 1 === d) {
                    isActive = true;
                }
                return (
                    <span key={d} onClick={()=>onMonthChange(d)}
                          className={classnames('month-item',{active:isActive})}>
                            <span>{d}月</span>
                        </span>
                )
            })}
        </div>
    )
};
export default MonthView
