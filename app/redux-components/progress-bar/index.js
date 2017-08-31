/**
 * Created by Hakim on 2017/2/20.
 */
import React, {Component} from 'react'
import './style.scss'
class ProgressBar extends Component {

    constructor(){
        super(...arguments)
        this.state = {
            progress:0
        }
    }

    addProgress(){
        if(this){
            let progress = this.state.progress
            let success = this.props.success
            if(this.props.isCompleted){
                this.setState({
                    progress:100
                },() => success())
                this.t = null
            } else {
                this.setState({
                    progress:progress < 96 ? progress + 2 : progress
                })
            }
        }
    }

    componentWillUnmount(){
        clearInterval(this.t)
    }

    componentDidMount(){
        this.t = setInterval(() => this.addProgress(), 50)
    }

    render(){

        let style = {
            width: this.state.progress + '%'
        }

        return(
            <div className="bar">
                <div className="progress" style={style}></div>
            </div>
        )
    }
}

ProgressBar.defaultProps = {
    isCompleted:false,
    success:()=>{},
    loading:()=>{}
}
export default ProgressBar