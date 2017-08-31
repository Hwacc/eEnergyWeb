/**
 * 创建于：2016-5-18
 * 创建人：杨骐彰
 * 说明： 列表组件
 */

require('./style.scss');
let React = require('react');
let classNames = require('classnames');

//列表
let List = React.createClass({
    propTypes: {
        striped: React.PropTypes.string,
        bordered: React.PropTypes.string
    },
    render(){
        const {children,striped,bordered,className} = this.props;
        let classes = classNames('sem-list', className, {
            'sem-list-striped': striped,
            'sem-list-bordered': bordered
        });
        return (
            <ul {...this.props}
                className={classes}>
                {children}
            </ul>
        );
    }
});

//列表项
List.Item = React.createClass({
    render(){
        const {children,className} = this.props;
        let classes = classNames('sem-list-item', className);
        return (
            <li {...this.props}
                className={classes}>
                {children}
            </li>
        );
    }
});

export default List
