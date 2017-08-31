/**
 * 创建于：2016-5-18
 * 创建人：杨骐彰
 * 说明： 面板组件
 */

require('./style.scss');
let React = require('react');
let classNames = require('classnames');

//面板
const Panel = React.createClass({
    propTypes: {
        theme: React.PropTypes.string
    },
    render() {
        const {theme,children,className} = this.props;
        let _theme = theme ? `sem-panel-${theme}` : '';
        let _classes = classNames('sem-panel', className, _theme);
        return (
            <div {...this.props}
                className={_classes}>
                {children}
            </div>
        )
    }
});

//面板头部
Panel.Header = React.createClass({
    propTypes: {
        text: React.PropTypes.string,
        align: React.PropTypes.string
    },
    render() {
        const {text,children,align,className} = this.props;
        let _classes = classNames('sem-panel-header', className, {
            'right-title': align === 'right',
            'center-title': align === 'center'
        });
        return (
            <div
                {...this.props}
                className={_classes}>
                <span className="sem-panel-title">
                    {text}
                </span>
                {children}
            </div>
        )
    }
});

//面板内容
Panel.Body = React.createClass({
    propTypes: {
        text: React.PropTypes.string,
        align: React.PropTypes.bool
    },
    render() {
        const {children,padding,className} = this.props;
        let _classes = classNames('sem-panel-body', className, {
            'has-padding': padding
        });
        return (
            <div {...this.props}
                className={_classes}>
                {children}
            </div>
        )
    }
});

export default Panel;

