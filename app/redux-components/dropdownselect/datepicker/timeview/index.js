
import TimeFullInput from 'timefullinput';
let React = require('react');
let classnames = require('classnames');



let _cloneDate = function (d) {
    return new Date(d.getTime());
};


module.exports = React.createClass({
    render(){
        
        let {year,month,value,onMonthChange,onOpenMonthView,onDayChange,onTimeChange} = this.props;
        let beginDate = new Date(year, month - 1, 1);
        let endDate = new Date(new Date(_cloneDate(beginDate).setMonth(_cloneDate(beginDate).getMonth() + 1)).setDate(0));
        let thisMonthDays = endDate.getDate() - beginDate.getDate() + 1;
        
        
        var days = [];
        for (let i = 1; i <= thisMonthDays; i++) {
            days.push({
                text: i,
                val: new Date(year, month - 1, i).getTime()
            });
        }


        let lastMonthEndDate = new Date(_cloneDate(beginDate).setDate(0));
        for (let i = 1, l = lastMonthEndDate.getDate(), j = beginDate.getDay(); i < j; i++) {
            days.unshift({
                text: l - i + 1,
                val: new Date(year, month - 2, i).getTime(),
                fade: true
            });
        }

        for (let i = 1, j = endDate.getDay() + 1; j <= 7; j++, i++) {
            days.push({
                text: i,
                val: new Date(year, month, i).getTime(),
                fade: true
            });
        }

        return (
            <div className="datepicker-drop-view time">
                <div className="switcher">
                    <span className="s-pre" onClick={()=>onMonthChange(month - 1)}>
                        &lt;
                    </span>
                    <span className="show-value" onClick={()=>onOpenMonthView()}>{year}年{month}月</span>
                    <span className="s-next" onClick={()=>onMonthChange(month + 1)}>
                        &gt;
                    </span>
                </div>
                
                <div className="weekend">
                    <span>一</span>
                    <span>二</span>
                    <span>三</span>
                    <span>四</span>
                    <span>五</span>
                    <span>六</span>
                    <span>日</span>
                </div>
                <div>
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
                              onClick={()=>onDayChange(new Date(d.val))}
                              className={classnames('day-item', {fade: d.fade, active: isToday})}>
                            <span>{d.text}</span>
                        </span>
                    )
                })}
                </div>
                <TimeFullInput  className="distanceX "
                                    style={{
                                               width: 300,
                                               boxSizing: "boder-box",
                                               boder: "1px solid #52caff",
                                               borderRadius: 4
                                               }}
                                    value={value}
                                    valChange={(val)=>{onTimeChange(val)}}
                />

            </div>

        );  
    }
});