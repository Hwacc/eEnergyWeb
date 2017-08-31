/**
 * Created by Hakim on 2017/2/8.
 */

var fs = require('fs');
var moment = require('moment')
var data = '';

const debug = (path) => (info) => {
    var rs = fs.createReadStream(path);
    if(global.debugReadData){
        debugReadData += moment(new Date()).format('YYYY-MM-DD HH:mm:ss')+':'+ info +' \n ';
    }else {
        global.debugReadData = '********'+moment(new Date()).format('YYYY-MM-DD')+'**********'
            +' \n'+ moment(new Date()).format('YYYY-MM-DD HH:mm:ss')+':'+ info +' \n';
        rs.on("data", function (trunk){
            debugReadData += trunk;
        })
    }
    rs.on("end", function () {
        fs.writeFile(path,debugReadData,{flags:'a+'},(err)=>{
            if(err){
                console.log(err)
            }
        })
    })

}



module.exports = debug;

