/**
 * 创建于：6/8/16
 * 创建人：杨骐彰
 * 说明：模态框组件
 */

let React = require('react');
let findDOMNode = require('react-dom').findDOMNode;
let render = require('react-dom').render;
let classnames = require('classnames');
let PreLoader = require('../preloader');
let closeImage = require('./close_icon.png');
let PubSub = require('pubsub-js');
let $ = require('jquery');
import Button from '../button'
require('./style.scss');


/***************modal 定义*****************/
let Modal = React.createClass({
    getDefaultProps(){
        return {
            onClose: ()=> {
            },
            onClosed: ()=> {
            },
            onOpen:()=>{
            },
            onOpened:()=>{
            }
        }
    },

    show(){
        let $modalEl = $(findDOMNode(this));
        $modalEl.height();
        $modalEl.addClass('modal-show');
        this.props.onOpen();
        setTimeout(()=> {
            this.props.onOpened();
        }, 300);
    },

    hide(){
        let $modalEl = $(findDOMNode(this));
        $modalEl.removeClass('modal-show');
        this.props.onClose();
        //setTimeout(()=> {
        $modalEl.hide();
        this.props.onClosed();
        //}, 200);
    },

    componentWillReceiveProps(newProps){
        if (newProps.show !== this.props.show) {
            if (newProps.show) {
                this.show();
            }
            else {
                this.hide();
            }
        }
    },

    componentDidMount(){
        this.props.show && this.show();
    },

    render(){
        let {children,className,width,show} = this.props;
        let classes = classnames('sem-modal', className);
        let style = {};
        if (width) {
            style.width = width * 1;
        }
        return (
            <div {...this.props}
                className={classes}>
                <div style={style}
                     className="sem-modal-body">
                    {children}
                </div>
            </div>
        )
    }
});

//头部
Modal.Header = React.createClass({
    render(){
        let {text,align,className,onClose} = this.props;
        let classes = classnames('sem-modal-header', className, {
            center: align === 'center'
        });
        return (
            <div {...this.props}
                className={classes}>
                <div className="">{text}</div>
                <img className="close" src={closeImage} onClick={onClose}>
                </img>
            </div>
        )
    }
});

let _style = {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    background: '#fff'
};
//内容
Modal.Content = React.createClass({
    render(){
        let {children,className,isLoading,loadingText,isLoadingFailed,loadingFailedText} = this.props;
        let classes = classnames('sem-modal-content', className);
        return (
            <div {...this.props}
                className={classes}>
                {children}
                {isLoading && <div style={_style}>
                    <PreLoader
                        align={true}
                        show={true}
                        text={loadingText}/>
                </div>}
                {isLoadingFailed && <div style={_style}>
                    <div
                        style={{position:'absolute',top:'45%',width:'100%',textAlign:'center'}}>{loadingFailedText}</div>
                </div>}
            </div>
        )
    }
});

//底部
Modal.Footer = React.createClass({
    render(){
        let {align,className,children} = this.props;
        let classes = classnames('sem-modal-footer', className, {
            'text-left': align === 'left',
            'text-right': align === 'right'
        });
        return (
            <div {...this.props}
                className={classes}>
                {children}
            </div>
        )
    }
});


/****************静态方法*****************/
const _type = {
    alert: 'ALERT',
    confirm: 'CONFIRM',
    close: 'CLOSE',
    loading: 'LOADING',
    closeLoading: 'LOADINGCLOSE'
};

//判断是否是字符串
function _isString(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
}

//创建容器
let container;
function _createComponent() {
    if (container)return;
    container = document.createElement('div');
    document.querySelector('body').appendChild(container);
    render(<ModalMessager />, container);
}

let Timer = React.createClass({
    getInitialState(){
        return {
            count: this.props.count
        }
    },

    getDefaultProps(){
        return {
            count: 5,
            onChange: ()=> {
            }
        }
    },

    componentDidMount(){
        this.timer = setInterval(()=> {
            this.setState({
                count: this.state.count - 1
            });
            this.props.onChange(this.state.count);
        }, 1000);
    },

    componentWillUnmount(){
        this.timer && clearInterval(this.timer);
    },

    render(){
        return <span>{this.state.count}</span>
    }
});

//modal 弹窗
let ModalMessager = React.createClass({
    getInitialState(){
        return {
            all: [],
            loading: false,
            loadingContent: null
        }
    },

    componentDidMount(){
        //提示类型
        PubSub.subscribe(_type.alert, (msg, data)=> {
            let d = Object.assign({
                type: _type.alert,
                fill: false,
                title: '提示',
                buttons: [],
                closeText: '取消',
                isOpen: true,
                onClose(){
                }
            }, data);
            let all = this.state.all;
            all.push(d);
            this.setState({all: all});
        });

        //确认类型
        PubSub.subscribe(_type.confirm, (msg, data)=> {
            let d = Object.assign({
                type: _type.confirm,
                fill: false,
                title: '确认提示',
                buttons: [],
                closeText: '取消',
                confirmText: '确定',
                isOpen: true,
                onClose(){
                },
                onConfirm(){
                }
            }, data);
            let all = this.state.all;
            all.push(d);
            this.setState({all: all});
        });

        //打开和关闭全局加载框
        PubSub.subscribe(_type.loading, (msg, content)=> {
            this.setState({loading: true, loadingContent: content})
        });

        PubSub.subscribe(_type.closeLoading, (msg, content)=> {
            this.setState({loading: false, loadingContent: null})
        });
    },

    /**
     * 关闭某个
     * @param one
     * @param index
     */
    closeOne(one, index){
        one.isOpen = false;
        this.setState({all: this.state.all});
        one.onClose();
    },

    /**
     * 移除某个
     * @param index
     */
    removeOne(index){
        this.state.all.splice(index, 1);
        this.setState({all: this.state.all});
    },

    /**
     * 渲染
     * @returns {Array}
     */
    renderAll(){
        return this.state.all.map((one, index)=> {
            switch (one.type) {
                case _type.alert:
                    return (
                        <Modal width="380" show={one.isOpen} key={index} onClosed={()=>{this.removeOne(index)}}>
                            <Modal.Header align='center' text={one.title} onClose={()=>this.closeOne(one,index)}/>
                            <Modal.Content>
                                <div className="text-center" style={{padding:'13px 0'}}>
                                    {one.content}
                                </div>
                            </Modal.Content>
                            <Modal.Footer>
                                <Button size="thin" type="outline" style={{width:100}}
                                        onClick={()=>this.closeOne(one,index)}>
                                    {one.closeText}
                                    (<Timer count={one.timer || 5}
                                            onChange={(t)=>{if(t===-1){this.closeOne(one,index)}}}/>)
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    );
                case _type.confirm:
                    return (
                        <Modal width="380" show={one.isOpen} key={index} onClosed={()=>{this.removeOne(index)}}>
                            <Modal.Header align='center' text={one.title} onClose={()=>this.closeOne(one,index)}/>
                            <Modal.Content>
                                <div className="text-center" style={{padding:'13px 0'}}>
                                    {one.content}
                                </div>
                            </Modal.Content>
                            <Modal.Footer>
                                <Button size="thin" type="outline" style={{width:100}}
                                        onClick={()=>this.closeOne(one,index)}>
                                    {one.closeText}
                                </Button>
                                <Button size="thin" style={{width:100}}
                                        onClick={()=>{
                                        this.closeOne(one,index);
                                        one.onConfirm();
                                        }}>
                                    {one.confirmText}
                                </Button>
                                {one.buttons.map((b, i)=> {
                                    return (
                                        <Button size="thin" style={{width:100}}
                                                onClick={()=>{
                                                this.closeOne(one,index);
                                                b.onClick();
                                                }}>
                                            {b.text}
                                        </Button>
                                    );
                                })}
                            </Modal.Footer>
                        </Modal>
                    );
            }
        });
    },
    render(){
        return <div>
            {this.renderAll()}
            {
            /**全局加载界面**/
                <Modal show={this.state.loading}>
                    <div className="text-center" style={{color:'#fff'}}>
                        {this.state.loadingContent || "正在处理，请稍等..."}
                    </div>
                </Modal>
            }
        </div>
    }
});

//提示框
Modal.alert = function (obj) {
    _createComponent();
    if (_isString(obj)) {
        obj = {
            content: obj
        }
    }
    PubSub.publish(_type.alert, obj);
};

//确认框
Modal.confirm = function (obj) {
    _createComponent();
    if (_isString(obj)) {
        obj = {
            content: obj
        }
    }
    PubSub.publish(_type.confirm, obj);
};

//打开全局加载，单例
Modal.loading = function (content) {
    _createComponent();
    PubSub.publish(_type.loading, content);
};

//打开关闭加载
Modal.closeLoading = function (content) {
    _createComponent();
    PubSub.publish(_type.closeLoading, content);
};

module.exports = Modal;
