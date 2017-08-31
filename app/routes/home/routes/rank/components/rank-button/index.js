/**
 * Created by Hakim on 2017/3/21.
 */
import React from 'react'
import './style.scss'
import { rankIcons } from 'icons'
const RankButton = (props)=>{
    let { onChange, data, mode} = props
    return(
        <div className="rank-button">
            <div className="rank-up"
            style={{backgroundImage:data[0] ===
            mode?`url(${rankIcons.rankUp})`:`url(${rankIcons.rankUpD})`}}
            onClick={()=>onChange(data[0])}></div>
            <div className="rank-down"
            style={{backgroundImage:data[1] ===
            mode?`url(${rankIcons.rankDown})`:`url(${rankIcons.rankDownD})`}}
            onClick={()=>onChange(data[1])}></div>
        </div>
    )
}
export default RankButton