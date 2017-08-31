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
    let {className,children,hoverable,stripped,bordered,noborder,align,style} = props;
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
               className={classes} style={style}>
            {children}
        </table>
    )
}


//表格头
Table.Head = (props)=>{
    let {className,titles,style} = props;
    let classes = classNames(className);
    return (
        <thead style={style}
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
    let {className,children,style} = props;
    let classes = classNames(className);
    return (
        <tbody style={style}
               className={classes}>
        {children}
        </tbody>
    )
}
//表格操作
Table.Operate = (props)=>{
    const {image,text,className,onClick,style,disabled} = props;
    let classes = classNames('sem-table-operate', className,{
        'disabled':disabled
    });
    return (
        <a href="javascript:;"
           onClick={()=>disabled?'':onClick()}
           className={classes}
           style={style}
        >
            {image && <img src={image}/>}
            {text}
        </a>
    )
}


Table.Th = (props)=>{
    
    let classes = classNames('th', props.className);
    return (
        <th >
            <div className={classes} style={{display:'inline-block'}}>
                {props.children}
            </div>
        </th>
    )
};
Table.Td = (props)=> {
    let classes = classNames('td', props.className);
    return(
        <td >
            <div className={classes} title={props.title}>
                {props.children}
            </div>
        </td>
    )
};
module.exports = Table;

