/**
 * Created by whj57 on 2017/1/22.
 */
import React from 'react'
import moment from 'moment'
import classnames from 'classnames'
import DateView from './dateview'
import MonthView from './monthview'
import YearView from './yearview'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { SelectState } from '../index'
import calenderIcon from './calender_icon.png'
import './style.scss'

export const _views = {
    year: 0,
    month: 1,
    day: 2,
    time: 3
}
export const DateSelect = (props)=>{
    let value = props.value||new Date()
    let {onChange,open,view,year,month,day,isMini,style,autoClose,date,isRight} = props
    let showView
    /**
     * 重置
     */
    const resetOptions = (obj)=>{
        return {
            year:obj.value.getFullYear(),
            month:obj.value.getMonth()+1,
            day:obj.value.getDate,
            view:_views[obj.endWith]
        }
    }
    /**
     * 开关下拉框
     */
    const handleClick = ()=>{
        if(!open){
            let initStates = resetOptions(props);
            onChange(Object.assign({},{open:!open},initStates))
        }else {
            onChange({
                open:!open
            })
        }
    }
    /**
     * 处理值更改
     */
    const handleValueChange = (val,autoClose)=>{
        onChange({value:val,open:!autoClose});
    };
    /**
     * 处理月份更改
     * @param d
     */
    const handleMonthChange=(d)=>{
        if (d > 12) {
            onChange({
                year:year+1,
                month:1
            });
        }
        else if (d < 1) {
            onChange({
                year:year-1,
                month:12
            })
        }
        else {
            onChange({
                month:d
            })
        }

        if (props.endWith === 'month') {

/*            this.setState({
                open: !this.props.autoClose
            });*/
            handleValueChange(new Date(year, d - 1, 1),autoClose);
        }
        else {
            if (view == _views.month) {
                onChange({view:_views.day})
            }
        }
    };
    /**
     * 处理年份更改
     */
    const handleYearChange = (y, sectionChange)=>{
        onChange({
            year:y
        });
        if (sectionChange) {
            return 0;
        }
        if (props.endWith === 'year') {
            handleValueChange(new Date(y, 0, 1),autoClose);
        }
        else {
            onChange({
                view:_views.month
            })
        }
    };
    /**
     * 获取展示值
     * @returns {string}
     */
    const getShowValue = (val)=>{
        let endWith = props.endWith;
        let value = val || props.value;
        let showValue = '';
        if (value instanceof Date && !isNaN(value.getTime())) {
            if(isMini) {
                switch (endWith) {
                    case 'year':
                        showValue = moment(value).format('YYYY年');
                        break;
                    case 'month':
                        showValue = moment(value).format('YYYY年MM月');
                        break;
                    case 'time':
                        showValue = moment(value).format('YYYY年MM月DD日 HH:mm:ss');
                        break;
                    default:
                        showValue = moment(value).format('YYYY年MM月DD日');
                }
            }else{
                switch (endWith) {
                    case 'year':
                        showValue = moment(value).format('YYYY');
                        break;
                    case 'month':
                        showValue = moment(value).format('YYYY-MM');
                        break;
                    case 'time':
                        showValue = moment(value).format('YYYY-MM-DD HH:mm:ss');
                        break;
                    default:
                        showValue = moment(value).format('YYYY-MM-DD');
                }
            }

        }
        return showValue;
    };

    if(view ===_views.year){
        showView =  <YearView key="year"
                              {...props}
                              onYearChange={handleYearChange}
        />;
    }else if(view ===_views.month){
        showView = <MonthView key="month"
                              {...props}
                              onYearChange={handleYearChange}
                              onMonthChange={handleMonthChange}
                              onOpenYearView={()=>onChange({
                                  view:_views.year
                              })}
        />;
    }else if(view === _views.day ){
        showView = <DateView key="day"
                             {...props}
                             onYearChange={handleYearChange}
                             onMonthChange={handleMonthChange}
                             onValueChange={(val)=>handleValueChange(val,autoClose)}
                             onOpenMonthView={()=>onChange({view:_views.month})}

        />;
    }
    let classNames = classnames('sem-datepicker', props.className,{open:open},isMini?'isMini':{});
    return(
        <div style={style}  onClick={(e)=>{e.stopPropagation();handleClick()}}
             className={classNames}>
            <input placeholder={props.placeholder}
                   type="text"
                   value = {getShowValue(value)}
                   readOnly = "readonly"
            />
            <img src={calenderIcon}
            />
            <ReactCSSTransitionGroup transitionName="fade-slide" transitionEnterTimeout={300}
                                     transitionLeaveTimeout={300}>
                {open && <div className={isMini ? "datepicker-drop-mini" : "datepicker-drop "}
                    style={isRight? {left:'-120px'}:{left:'0px'}}
                >
                  {/*  style={[props.endWith === 'time' ? {height: 290} : {},isRight? {left:-120}:{left:0}]}*/}
                    <span className="arrow" style={isRight?{left:"140px"}:{}}>
                        </span>
                    <ReactCSSTransitionGroup transitionName="fade-scale" transitionEnterTimeout={300}
                                             transitionLeaveTimeout={300}>
                        {showView}
                    </ReactCSSTransitionGroup>
                </div>}
            </ReactCSSTransitionGroup>
        </div>
    )
};
export class DateSelectState extends SelectState{
    constructor(selects){
       super(...arguments)
        this.options = {
            onChange:(d)=>{},
            placeholder:'选择日期',
            value:new Date(),
            autoClose:true,
            open:false,
            endWith:'day',
        }
        selects = selects.map(i=>[i[0],Object.assign({},this.options,i[1])]);
        this.selects = new Map(selects);
    }
}
