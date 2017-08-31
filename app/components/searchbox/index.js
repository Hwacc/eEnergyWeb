/**
 * 创建于：2016-5-19
 * 创建人：杨骐彰
 * 说明：搜索框
 */
import React,{Component} from 'react'
import classNames from 'classnames'
import './style.scss'

class SearchBox extends Component {
    constructor(props) {
        super(...arguments);

        //处理按钮事件
        this._keyHandler = function (e) {
            //enter键
            if (e.charCode === 13) {
                props.onChange(props.value);
            }
        }.bind(this);
    }

    render() {
        const {className,placeholder,block, value,onChange,onSearch} = this.props;
        let classes = classNames('sem-search-box', className, {
            'block': block
        });

        return (
            <div onKeyPress={this._keyHandler} {...this.props}
                 className={classes}
            >
                <input onChange={onChange} value={value} placeholder={placeholder} type="text"/>
                <span onClick={()=>{onSearch(value)}} className="search-icon">
                </span>
            </div>
        )
    }
}

SearchBox.propTypes = {
    placeholder: React.PropTypes.string,
    block: React.PropTypes.bool,
    value: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onSearch: React.PropTypes.func.isRequired
};

SearchBox.defaultProps = {
    placeholder: '请输入搜索内容...'
};

export default SearchBox;

