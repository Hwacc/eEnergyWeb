/**
 * 创建于：2016-5-23
 * 创建人：杨骐彰
 * 说明：table组件
 */

require('./style.scss');
let React = require('react');
let classNames = require('classnames');

//表格
let  Table = (props)=>{
    let {className,children,hoverable,stripped,bordered,noborder,align} = props;
    let classes = classNames('sem-table', className, {
        'sem-table-hoverable': hoverable,
        'sem-table-stripped': stripped,
        'sem-table-bordered': bordered,
        'sem-table-noborder': noborder,
        'sem-text-left': align === 'left',
        'sem-text-right': align === 'right'
    });
    return (
        <table
               className={classes}>
            {children}
        </table>
    )
}


//表格头
Table.Head = (props)=>{
    let {className,titles} = props;
    let classes = classNames(className);
    return (
        <thead
               className={classes}>
        <tr>
            {titles.map((t, i)=> {
                return (
                    <th key={i}>
                        {t}
                    </th>
                )
            })}
        </tr>
        </thead>
    )
}
//表格内容

Table.Body = (props)=>{
    let {className,children} = props;
    let classes = classNames(className);
    return (
        <tbody
               className={classes}>
        {children}
        </tbody>
    )
}
//表格操作
Table.Operate = (props)=>{
    const {image,text,className,onClick} = props;
    let classes = classNames('sem-table-operate', className);
    return (
        <a href="javascript:;"
           onClick={()=>onClick()}
           className={classes}>
            {image && <img src={image}/>}
            {text}
        </a>
    )
}


Table.Th = (props)=>{
    let classes = classNames('th', props.className);
    return (
        <th >
            <div className={classes}>
                {props.children}
            </div>
        </th>
    )
};
Table.Td = (props)=> {
    let classes = classNames('td', props.className);
    return(
        <td >
            <div className={classes}>
                {props.children}
            </div>
        </td>
    )
};
module.exports = Table;

