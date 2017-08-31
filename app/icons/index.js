/**
 * 创建于：2016-6-13
 * 创建人：qizhang
 * 说明：图片库
 */
import sidebar from './sidebar'
import airControl from './control'
import weatherIcons from './weather'
import homePage from './hompage'
import login from './login'
import treeList from './treeList'
import rankIcons from './rank'
const icons = {
    control:require('./contrl_icon.png'),
    exports: require('./export_icon.png'),
    add: require('./new_icon.png'),
    modify: require('./modify_icon.png'),
    disband: require('./disband_icon.png'),
    detail: require('./detail_icon.png'),
    unbind: require('./unbind_icon.png'),
    delete: require('./del_icon.png'),
    administrator: require('./administrator_icon.png'),
    dividingLineV: require('./dividing_line_v.png'),
    dividingLineH: require('./dividing_line_h.png'),
    logout: require('./logout_icon.png'),
    uploader:require('./file_icon.png'),
    time:require('./time_icon.png'),
    choose:require('./icon_choose.png'),
    unChoose:require('./icon_unchoose.png'),
    addUser:require('./icon_newpeople.png'),
    addArea:require('./icon_addarea.png'),
    noArea: require('./icon_noarea.png'),
    bgAccount: require('./bg_account .png'),
    logo: require('./logo.png'),
    uploaderNow:require('./icon_upload.png'),
    uploaderCompleted:require('./icon_uploaded.png'),
    background: require('./background.png'),
    report:require('./icon_report_list.png'),
    arrowBottom:require('./drop_icon.png'),
    compareCircle:require('./icon_compare_circle.png'),
    infrared:require('./icon_outlet.png'),
    noDevice: require('./icon_nodevice.png'),
    condition:require('./icon_fold.png'),
    areaAc: require('./icon_area_ac.png'),
    areaLight: require('./icon_area_light.png'),
    addTask: require('./icon_add.png'),
    batchClose: require('./icon_batch_close.png'),
    batchOpen: require('./icon_batch_open.png'),
    addMode: require('./icon_add_mode.png'),
    return: require('./icon_return.png'),
    addWay: require('./icon_add_way.png'),
    sidebar,
    airControl,
    weatherIcons,
    homePage,
    login,
    treeList,
    rankIcons

};

export default icons

module.exports = icons;

