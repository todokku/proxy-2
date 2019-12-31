exports.postDATA = function (url) {
    url = url.replace(/amp;/ig, '').replace(/http(s?):\/\/mp.weixin.qq.com\/s\?/, '')
    url = url.replace(/https:\/\/mp.weixin.qq.com\/mp\/profile_ext\?/, '')
    var obj = {};
    url.split("&").map(item => {
        let newItem = item.split("=");
        obj[newItem[0].replace('search', '')] = decodeURIComponent(decodeURIComponent(newItem[1])).replace('#wechat_redirect', '');
    });
    return obj;
}

exports.ip = function () {
    let interfaces = require("os").networkInterfaces()
    let ip = ''
    for (var n in interfaces) {
        interfaces[n].map(item => {
            if (item.family === 'IPv4' && item.address !== '127.0.0.1' && !item.internal) {
                ip = item.address;
            }
        })
    }
    return ip
}

exports.id = function () {
    return Math.random().toString(16).substr(2)
}

exports.rdNum = function (minNum, maxNum) {
    return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10)
}

exports.nowDATE = function () {
    var date = new Date
    var y = date.getFullYear()
    var m = date.getMonth() >= 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)
    var d = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate()
    var th = date.getHours() >= 10 ? date.getHours() : '0' + date.getHours()
    var tm = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes()
    var ts = date.getSeconds() >= 10 ? date.getSeconds() : '0' + date.getSeconds()
    return `${y}-${m}-${d} ${th}:${tm}:${ts}`
}

exports.cut = (data, num = 1, nowtime, curIndex) => {
    var tmpArr = []
    for (var i = 0; i < data.length; i += Math.ceil(data.length / num)) {
        tmpArr.push(data.slice(i, i + Math.ceil(data.length / num)))
    }
    var newArr = tmpArr.map((item, index) => {
        item.map(val => (val.wx = index + 1, val.time = nowtime, val.index = curIndex))
        return item
    })
    return newArr.flat()
}