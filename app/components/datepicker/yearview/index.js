/**
 * 创建于：6/6/16
 * 创建人：qizhang
 * 说明：
 */
let React = require('react');
let classnames = require('classnames');

module.exports = React.createClass({
    render(){
        const {year,value,onYearChange} = this.props;
        let yearsSection = [];
        for (let i = -6; i < 6; i++) {
            yearsSection.push(year + i);
        }
        return (
            <div className="datepicker-drop-view">
                <div className="switcher">
                    <span className="s-pre" onClick={()=>onYearChange(year - 12, true)}>
                        &lt;
                    </span>
                    <span className="show-value">
                        {yearsSection[0]}~{yearsSection[11]}
                    </span>
                    <span className="s-next" onClick={()=>onYearChange(year + 12, true)}>
                        &gt;
                    </span>
                </div>
                {yearsSection.map((d)=> {
                    return (
                        <span key={d}
                              onClick={()=>onYearChange(d)}
                              className={classnames('year-item',{active:value && value.getFullYear && value.getFullYear() === d})}>
                            <span>{d}</span>
                        </span>
                    )
                })}
            </div>
        )
    }
});