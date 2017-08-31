/**
 * Created by qizhang on 5/1/16.
 * 路由配置页面
 */

import React from 'react'
import { Router,  hashHistory} from 'react-router'
import App from './components/app'
import Home from './routes/home'
import Login from './routes/login'
import Location from './routes/location'

const rootRoute = {
    childRoutes: [{
        path: '/',
        indexRoute: { onEnter: (nextState, replace) => replace('/home') },
        component: App,
        childRoutes: [
            Home,
            Login,
            Location
        ]
    }]
};
Router.propTypes = {
    history:React.PropTypes.object,
    routes:React.PropTypes.object,
}
const rest  = {history:hashHistory,routes:rootRoute};
export default  <Router  {...rest}/>