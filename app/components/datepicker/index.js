/**
 * 创建于：6/6/16
 * 创建人：杨骐彰
 * 说明：时间选择器
 */

let React = require('react');
let ReactDOM = require('react-dom');
let $ = require('jquery');
let moment = require('moment');
let classnames = require('classnames');
let TimeView = require('./timeview');
let DateView = require('./dateview');
let MonthView = require('./monthview');
let YearView = require('./yearview');
let calenderIcon = require('./calender_icon.png');
let ReactCSSTransitionGroup = require('react-addons-css-transition-group');
require('./style.scss');

const _views = {
    year: 0,
    month: 1,
    day: 2,
    time: 3
};

let DatePicker = React.createClass({
    getInitialState(){
        let props = this.props;
        let value = props.value || new Date();
        let view;
        switch (props.endWith) {
            case 'year':
                view = _views.year;
                break;
            case 'month':
                view = _views.month;
                break;
            case 'time':
               
            default:
                view = _views.day;
        }

        return {
            year: value.getFullYear(),
            month: value.getMonth() + 1,
            day: value.getDate(),
            currentView: view,
            open: false
           
        }
    },

    getDefaultProps: function () {
        return {
            onChange: (d)=> {
            },
            endWith: 'day',
            autoClose: true,
            placeholder: '选择日期'
        }
    },

    /**
     * 处理月份更改
     * @param d
     */
    handleMonthChange(d){
        if (d > 12) {
            this.setState({
                year: this.state.year + 1,
                month: 1
            })
        }
        else if (d < 1) {
            this.setState({
                year: this.state.year - 1,
                month: 12
            })
        }
        else {
            this.setState({
                month: d
            })
        }

        if (this.props.endWith === 'month') {
            this.setState({
                open: !this.props.autoClose
            });
            this.handleValueChange(new Date(this.state.year, d - 1, 1));
        }
        else {
            if (this.state.currentView == _views.month) {
                this.setState({
                    currentView: _views.day
                })
            }
        }
    },

    /**
     * 处理年份更改
     */
    handleYearChange(year, sectionChange){
        if (sectionChange) {
            this.setState({
                year: year
            });
        }
        else {
            if (this.props.endWith === 'year') {
                this.setState({
                    year: year,
                    open: !this.props.autoClose
                });
                this.handleValueChange(new Date(year, 0, 1));
            }
            else {
                this.setState({
                    year: year,
                    currentView: _views.month
                });
            }
        }
    },

    /**
     * 处理值更改
     */
    handleValueChange(val){
        const {onChange} = this.props;
        onChange(val);
        this.props.autoClose && this.close();
    },
    /**
     * 详细时间修改中日期修改不关闭下拉框
     */
    handleDayChange(val){
        let value = this.props.value;
        let values = (this.getShowValue(val)).split(" ");
        let vals = (this.getShowValue(value)).split(" ");
        let newVal = values[0]+ " " + vals[1];
        let date = new Date(newVal);
        const {onChange} = this.props;
        onChange(date);
        
    },
    /**
     * 详细时间修改不关闭下拉框
     */
    handleTimeChange(val){
        let value = this.props.value;
        let vals = (this.getShowValue(value)).split(" ");
        let newVal = vals[0]+ " " + val;
        let date = new Date(newVal);
        const {onChange} = this.props;
        onChange(date);
       
    },

    /**
     * 重置视图
     */
    resetView(val){
        let value = val || this.props.value || new Date();
        let view;
        switch (this.props.endWith) {
            case 'year':
                view = _views.year;
                break;
            case 'month':
                view = _views.month;
                break;
            case 'time':
                
            default:
                view = _views.day;
        }
        
        this.setState({
            year: value.getFullYear(),
            month: value.getMonth() + 1,
            day: value.getDate(),
            currentView: view
        });
        
       
    },

    /**
     * 打开,打开时重置时间
     */
    open(){
        let {open} =this.state;
        this.resetView();
        if(open){
            this.setState({open: false});   
        }else {
            this.setState({open: true});
        }
    },

    /**
     * 关闭
     */
    close(){
        this.setState({
            open: false
        });
    },

    /**
     * 获取展示值
     * @returns {string}
     */
    getShowValue(val){
        let endWith = this.props.endWith;
        let value = val || this.props.value;
        let isMini = this.props.isMini;
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
    },
    
    componentDidMount(){
        let componentDOM = ReactDOM.findDOMNode(this);
        this._winClickHandler = function (e) {
            let has = false;
            let target = e.target;
            if (componentDOM === target || $(target).closest($(componentDOM)).length) {
                has = true;
            }
            !has && this.close();
        }.bind(this);
        
        $(window).on('click', this._winClickHandler);
    },

    componentWillUnmount(){
        $(window).off('click', this._winClickHandler);
    },

    render(){
        const {year,month,currentView,open} = this.state;
        let value = this.props.value;
        let isMini = this.props.isMini;
        let view;
        if (currentView === _views.year) {
            view = <YearView key="year"
                             year={year}
                             value={value}
                             onYearChange={this.handleYearChange}
            />;
        }
        else if (currentView === _views.month) {
            view = <MonthView key="month"
                              year={year}
                              value={value}
                              onYearChange={this.handleYearChange}
                              onMonthChange={this.handleMonthChange}
                              onOpenYearView={()=>this.setState({currentView:_views.year})}
            />;
        }
        else if(currentView === _views.day) {
            if (this.props.endWith !== 'time') {
                view = <DateView key="day"
                                 year={year}
                                 month={month}
                                 value={value}
                                 onMonthChange={this.handleMonthChange}
                                 onOpenMonthView={()=>this.setState({currentView:_views.month})}
                                 onValueChange={this.handleValueChange}
                />;
            } else {
                view = <TimeView key="time"
                                 year={year}
                                 month={month}
                                 value={value}
                                 onMonthChange={this.handleMonthChange}
                                 onOpenMonthView={()=>this.setState({currentView:_views.month})}
                                 onDayChange={this.handleDayChange}
                                 onTimeChange = {this.handleTimeChange}
                />;
            }
        }

        let classNames = classnames('sem-datepicker', this.props.className, {open: open},isMini?'isMini':{});

        return (
            <div {...this.props}
                className={classNames}>
                <input placeholder={this.props.placeholder}
                       type="text"
                       onClick={this.open}
                       value = {this.getShowValue(value)}
                       readOnly = "readonly"
                />
                <img src={calenderIcon}
                     onClick={this.open}
                />
                <ReactCSSTransitionGroup transitionName="fade-slide" transitionEnterTimeout={300}
                                         transitionLeaveTimeout={300}>
                    {open && <div className={isMini ? "datepicker-drop-mini":"datepicker-drop "}  style={this.props.endWith === 'time' ? {height:290}:{}
                    }>
                        <span className="arrow">
                        </span>
                        <ReactCSSTransitionGroup transitionName="fade-scale" transitionEnterTimeout={300}
                                                 transitionLeaveTimeout={300}>
                            {view}
                        </ReactCSSTransitionGroup>
                    </div>}
                </ReactCSSTransitionGroup>
            </div>
        )
    }
});

module.exports = DatePicker;


