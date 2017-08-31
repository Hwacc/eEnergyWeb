/**
 * 创建于：2016-5-24
 * 创建人：杨骐彰
 * 说明：分页组件
 */
import React,{Component} from 'react'
import classNames from 'classnames'
import './style.scss'

function getShowList(cp, tp, show) {
    let list = [];
    //总页数小于等于显示页数
    if (show >= tp) {
        for (let i = 1; i <= tp; i++) {
            list.push({
                t: i,
                v: i
            })
        }
        return list;
    }

    //如果当前页位于前面
    else if (cp <= show - 3) {
        for (let i = 1; i <= show - 2; i++) {
            list.push({
                t: i,
                v: i
            });
        }
        list.push({
            t: '...',
            v: show - 1
        });
        list.push({
            t: tp,
            v: tp
        })
    }

    //如果当前页已经位于最后
    else if (cp + show - 3 >= tp) {
        for (let i = tp; i > tp - show + 2; i--) {
            list.unshift({
                t: i,
                v: i
            })
        }
        list.unshift({
            t: '...',
            v: tp - show + 2
        });
        list.unshift({
            t: 1,
            v: 1
        });
    }

    //如果就在中间
    else {
        list.push({
            t: 1,
            v: 1
        });
        let _t = Math.ceil((show - 4) / 2);

        list.push({
            t: '...',
            v: cp - _t - 1
        });
        for (let i = cp - _t; i <= cp + _t; i++) {
            list.push({
                t: i,
                v: i
            });
        }
        list.push({
            t: '...',
            v: cp + _t + 1
        });
        list.push({
            t: tp,
            v: tp
        });
    }
    return list;
}

export default class Pagination extends Component {
    render() {
        const {current,size,total,show,onChange} = this.props;
        let showList = [];
        let totalPage = 0;
        if(total&&size){
            totalPage = Math.ceil(total / size);
            showList = getShowList(current, totalPage, show);
        }
        let classes = classNames('sem-pagination', {
            hide: !total
        });
        return (
            <div className={classes}>
                <span onClick={()=>{current!==1&&onChange(current-1)}} className={"pre" + (current<=1?" disabled":"")}>
                    {'<'}
                </span>
                {showList.map((s, i)=> {
                    let classes = classNames({
                        'active': s.v === current,
                        'item': s.t !== '...',
                        'ellipsis': s.t === '...'
                    });
                    return (<span onClick={()=>{onChange(s.v)}} className={classes} key={i}>{s.t}</span>)
                })}
                <span onClick={()=>{current<totalPage && onChange(current + 1)}}
                      className={"next" + (current>=totalPage?" disabled":"")}>
                    {'>'}
                </span>
            </div>
        )
    }
}

Pagination.propTypes = {
    //总数
    total: React.PropTypes.number.isRequired,
    //每页条数
    size: React.PropTypes.number.isRequired,
    //显示多少页
    show: React.PropTypes.number,
    //当前页数
    current: React.PropTypes.number.isRequired,
    //点击事件
    onChange: React.PropTypes.func.isRequired
};

Pagination.defaultProps = {
    show: 6
};