/**
 * 创建于：6/12/16
 * 创建人：qizhang
 * 说明：
 */
/**
 * Created by qizhang on 5/3/16.
 * select 控件,非原生控件
 */
import React,{Component} from 'react';
import {findDOMNode} from 'react-dom'
import $ from 'jquery'
import classnames from 'classnames'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import './style.scss'

/**
 * 列表组件
 */
export class SelectList extends Component {
    constructor() {
        super(...arguments);
    }

    handleClick(e, item) {
        const {autoClose,value,onChange,allowEmpty,multiple} = this.props;
        //不自动关闭
        if (!autoClose || multiple) {
            e.stopPropagation();
        }
        //单选模式
        if (!multiple) {
            if (allowEmpty) {
                onChange(value === item.value ? null : item.value,
                    value === item.value ? null : item.name);
            }
            else {
                onChange(item.value,item.name);
            }
        }
        //多选模式
        else {
            if (!value) {
                onChange([item.value]);
            }
            else {
                //如果value已有此项，则为取消
                if (value.some((v)=>v === item.value)) {
                    onChange(value.filter((v)=>v !== item.value))
                }
                else {
                    onChange(value.concat([item.value]));
                }
            }
        }
    }

    render() {
        const {options,value,isLoading,isLoadFailed,multiple} = this.props;
        return (
            <div className="select-drop-down">
                <span className="arrow">
                </span>
                <div className="select-list">
                    {
                        (()=> {
                            if (options && options.length > 0) {
                                //单选
                                if (!multiple) {
                                    return options&&options.map((item, i)=> {
                                        return (
                                            <div key={i}
                                                 onClick={(e)=>this.handleClick(e,item)}
                                                 className={'select-list-item ' + (value === item.value?'active':'')}>
                                                {item.name}
                                            </div>
                                        )
                                    })
                                }
                                //多选
                                else {
                                    return options&&options.map((item, i)=> {
                                        //是否激活
                                        let active;
                                        if (!value && value.length === 0) {
                                            active = false;
                                        }
                                        else {
                                            active = value.some((v)=>v === item.value);
                                        }

                                        return (
                                            <div key={i}
                                                 onClick={(e)=>this.handleClick(e,item)}
                                                 className={'select-list-item ' + (active?'active':'')}>
                                                {item.name}
                                            </div>
                                        )
                                    });
                                }
                            }
                            else if (isLoadFailed) {
                                return <div className="empty">{'加载失败，请重试'} </div >
                            }
                            else {
                                return <div className="empty">{isLoading ? '正在加载...' : '没有可选择的项'} </div >
                            }
                        })()
                    }
                </div>
            </div>
        )
    }
}

SelectList.defaultProps = {
    options: [],
    onChange: ()=> {
        return;
    },
    allowEmpty: true
};

/**
 * select选择框
 */
class Select extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            open: false,
            selectedShowString: ''
        };
    }

    /**
     * 打开选择框
     * @param e
     */
    toggle(e) {
        //如果打开时未加载成功过,则重新加载
        !this.state.open && this.props.onOpen();
        this.setState({
            open: !this.state.open
        });
    }

    /**
     * 关闭选择框
     */
    close() {
        this.setState({
            open: false
        });
    }

    /**
     * 处理值更改
     * @param item
     * @param name
     */
    handleChange(item,name) {
        this.props.onChange(item,name);
    }

    componentDidMount() {
        //如果不是懒加载就立刻加载
        if (!this.props.lazy) {
            this.props.onOpen();
        }
        let componentDOM = findDOMNode(this);
        this._winClickHandler = function (e) {
            let has = false;
            let target = e.target;
            if (componentDOM === target || $(target).closest($(componentDOM)).length) {
                has = true;
            }
            !has && this.close();
        }.bind(this);

        $(window).on('click', this._winClickHandler);

        //自动选择
        const {autoSelect,multiple,options,onChange} = this.props;
        if (autoSelect && options && options.length) {
            if (multiple) {
                onChange(options[0].value);
            }
            else {
                onChange([options[0]].value);
            }
        }
    }

    componentWillUnmount() {
        $(window).off('click', this._winClickHandler);
    }

    render() {
        const {placeholder,value,className,options,label,size,width,style,multiple,splitter} = this.props;
        const classes = classnames('sem-select', className, {
            'open': this.state.open,
            'thin': size === 'thin'
        });
        let showText = '';
        if ((value || value === 0) && options) {
            if (!multiple) {
                let option = options.filter((o)=> {
                    return o.value === value;
                });
                showText = option[0] ? option[0].name : placeholder;
            }
            else {
                if (!Array.isArray(value)) {
                    throw Error('多选情况下value必须是数组或者空值');
                }
                let activeOptions = options.filter((o)=> {
                    return value.some((v)=> {
                        return o.value === v;
                    });
                });

                if (!activeOptions.length) {
                    showText = placeholder;
                }
                else {
                    showText = activeOptions.map((ao)=>ao.name).join(splitter);
                }
            }
        }
        else {
            showText = placeholder;
        }

        let _style = style || {};
        //如果定义了宽度
        width && Object.assign(_style, style, {width: (width + '').replace('px', '') + 'px', minWidth: 'auto'});

        return (
            <div {...this.props}
                style={_style}
                onClick={this.toggle.bind(this)}
                className={classes}>
                <div className="select-picker">
                    {label && <span className="select-label">{label}</span>}
                    {showText}
                </div>
                <span className="select-drop-icon">
                </span>
                <ReactCSSTransitionGroup transitionName="fade-slide" transitionEnterTimeout={300}
                                         transitionLeaveTimeout={300}>
                    {this.state.open && <SelectList {...this.props} onChange={this.handleChange.bind(this)}/>}
                </ReactCSSTransitionGroup>
            </div>
        )
    }
}

Select.defaultProps = {
    onOpen: ()=> {
    },
    //懒加载
    lazy: false,
    placeholder: '请选择...',
    //自动关闭
    autoClose: true,
    //标签
    label: null,
    //是否开启多选
    multiple: false,
    //自动选择，仅初始化时有效
    autoSelect: false,
    //多选分隔符
    splitter: ',',
    allowEmpty: false
};

export default Select;
