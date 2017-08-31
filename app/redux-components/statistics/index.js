/**
 * Created by whj57 on 2016/12/26.
 */
import './style.scss'
import Table from 'redux-components/table'
import React from 'react'
import classnames from 'classnames'
const Statistics = (props)=>{
    let {title,foots,data,className} = props;
    let _classes = classnames('statistic-wrapper',className);
    return(
        <div className={_classes}>
            <div className="word-title">
                {title}
                <span>{foots}</span>
            </div>
            <div className="word-body">

                <Table align="left" noborder={true}>
                    <Table.Body>
                        {data&&data.map((item,fKey)=>{
                            return(
                                <tr key={fKey}>
                                    {
                                        item.map((i,key)=>{
                                            return<td key={[fKey,key].join('')}>
                                                <div className="num">{i.num&&(i.num*1).toFixed(2)}

                                                    {
                                                        i.changeNum&&<span className={i.isAdd?'is-add':''}><i> </i>
                                                            {i.changeNum}</span>
                                                    }</div>
                                                <div className="name">{i.name}</div>
                                            </td>
                                        })
                                    }
                                </tr>
                            )
                        })}
                    </Table.Body>
                </Table>
            </div>
        </div>

    )
};
Statistics.defaultProps = {
    data:[[{num:0.00,isAdd:true,changeNum:'0%',name:'本日用电量'},
        {num:0.00,isAdd:false,changeNum:'0%',name:'本月用电量'}],
        [{num:0.00,name:'昨日同期'},{num:0.00,name:'上月同期'}]]
};
export default Statistics