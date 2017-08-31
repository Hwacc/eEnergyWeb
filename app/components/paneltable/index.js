/**
 * 创建于：2016-5-26
 * 创建人：杨骐彰
 * 说明：带表格的面板
 */

import React,{Component} from 'react'
import Panel from '../panel'
import PreLoader from '../preloader'

let _style = {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    background: '#fff'
}
export default class PanelTable extends Component {
    render() {
        const {children,text,align,isLoading,loadingText,showHeader} = this.props;
        return (
            <Panel {...this.props}>
                {showHeader && <Panel.Header text={text}
                                             align={align}
                />}
                <Panel.Body style={{position:'relative'}}>
                    {children}
                    {
                        isLoading &&
                        <div style={_style}>
                            <PreLoader
                                show={true}
                                text={loadingText}/>
                        </div>
                    }
                </Panel.Body>
            </Panel>
        )
    }
}

PanelTable.defaultProps = {
    showHeader: true
};
