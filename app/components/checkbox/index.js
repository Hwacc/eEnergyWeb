/**
 * 创建于：2016-5-19
 * 创建人：杨骐彰
 * 说明： checkbox组件
 */
import React,{Component} from 'react'
import classNames from 'classnames'
import './style.scss'

class Checkbox extends Component {
    render() {
        const {className,checked} = this.props;
        let classes = classNames("sem-checkbox", className, {
            'checked': checked
        });
        return (
            <div
                {...this.props}
                className={classes}>
            </div>
        )
    }
}

Checkbox.propTypes = {
    checked: React.PropTypes.bool
};

export default Checkbox;
