/**
 * Created by whj on 2016/5/12.
 */
import React,{Component} from 'react'
import './dropdownBox.scss'
import $ from 'jquery'
import classNames from 'classnames'
import PreLoader from '../preloader'
class DropDownBox extends Component{
    constructor() {
        super(...arguments);
        this.state = {
            display:false
        }
    };
    handleInputClick(e){
        var self = this;
        $(self.refs.dropdown).addClass('active')
        this.setState({display:!this.state.display});
    };
    componentDidMount(){
        var self = this;
        var targets ;
        this.refs.dropdown.addEventListener('click',function(e){
            targets =e.target
        });
      $(document).on('click',function(e){
          if(e.target != targets)
          self.setState({display:false});
          targets=''
      })
    };
    componentWillUnmount(){
      $(document).off('click')
    };
    handleClick(item) {
        var value = item.value;
        this.props.onChange(value);
        var self = this;
        this.setState({display: false});
    }
    render(){
        const {value, options, inline,placeholder,className,loading,label} = this.props;
        let name;
        for(var i =0;i<options.length;i++){
            if(options[i].value==value){
                name = options[i].name;
            }
        }
        let classes = classNames('select-wrapper',className,{
            'active':this.state.display,
            'inline':inline
        });
        return(
            <div {...this.props} className={classes} ref='dropdown'>
                <div className="block-div"></div>
                <div className="select" >
                    <div className="input"  onClick={(this.handleInputClick.bind(this))}>
                        {
                            label?<label style={{fontSize:'12px',color:'#939393'}}>{label}</label>:''
                        }
                        {
                            label?<div className="text" ref="text" style={{fontSize:'12px',textAlign:'right'}}>{name?name:placeholder}</div>
                                :<div className="text" ref="text">{name?name:placeholder}</div>
                        }
                        <input type="hidden" value={value} ref="input"/>
                        <span></span>
                    </div>
                    {
                        loading?
                            <div className={this.state.display?'drop-down-group display':'drop-down-group'}>
                                <PreLoader show={loading} />
                            </div>
                            : <div className={this.state.display?'drop-down-group display':'drop-down-group'} >
                                {
                                    options.map((item)=> {
                                        return this.props.value==item.value?
                                            <div className="option checked"  key={item.value}
                                                 onClick={(()=>{this.handleClick(item)})}>{item.name}</div>:
                                            <div className="option"  key={item.value}
                                                 onClick={(()=>{this.handleClick(item)})}>{item.name}</div>
                                    })
                                }
                            </div>
                    }
                </div>
            </div>
        )
    };
}
DropDownBox.propTypes={
    options:React.PropTypes.array
};

export default DropDownBox;