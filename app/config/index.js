/**
 * Created by qizhang on 5/4/16.
 * 应用配置
 */

let config = {};
if (__PROD__) {
    //api地址
    config.apiHost = 'http://123.56.160.179:9091/api'
    //config.apiHost = 'http://123.56.160.179:9091/api';
    //config.apiHost = 'http://localhost:12345/api';
    //config.apiHost = 'http://111.9.116.140:9091/api';
}
else{
    //config.apiHost = 'http://111.9.116.140:18081/api'
    //config.apiHost = 'http://123.56.160.179:6061/api';
   // config.apiHost = 'http://localhost:12345/api'
    config.apiHost = 'http://123.56.160.179:9091/api'

}

export default config

