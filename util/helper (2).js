exports.postDATA = function (url) {

    url = url.replace(/&amp;/ig, '&').replace(/https:\/\/mp.weixin.qq.com\/s\?/, '')

    var obj = {};
    url.split("&").map(item => {
        let newItem = item.split("=");
        obj[newItem[0].replace('search', '')] = decodeURIComponent(decodeURIComponent(newItem[1])).replace('#wechat_redirect', '');
    });


    return obj;
}

exports.id = function () {
    return Math.random().toString(16).substr(2)
}

exports.rdNum = function(minNum,maxNum) { 
    return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10)
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


// 玩具零售店如何更赚钱？小猪趣玩告诉你业绩提升50%的秘诀
exports.findArticle = function (data, search) {
    var result = {
        title: false,
        time: false,
        pos: false
    };
    var moredata = {
        title: '',
        datetime: -1,
        url: ""
    };
    data.map((item, index) => {
        if (item.app_msg_ext_info.title == search.title) {
            result["title"] = true;
            moredata["title"] = item.app_msg_ext_info.title;
            if (search.pos == 1) result["pos"] = true;

            if (item.comm_msg_info.datetime == search.time) {
                result["time"] = true;
                moredata['datetime'] = item.comm_msg_info.datetime;
            }
            moredata["url"] = item.app_msg_ext_info.content_url;
        } else {
            var sub = item.app_msg_ext_info.multi_app_msg_item_list;
            if (sub != undefined) {
                sub.map((val, key) => {
                    if (val.title == search.title) {
                        result["title"] = true;
                        moredata["title"] = val.title;
                        if (search.pos == 2 + key) result["pos"] = true;

                        if (item.comm_msg_info.datetime == search.time) {
                            result["time"] = true;
                            moredata['datetime'] = item.comm_msg_info.datetime;
                        }
                        moredata["url"] = val.content_url;
                    }
                });
            }
        }
    });

    var exist = Object.values(result).every(item => item == true);

    return {
        exist, // 是否存在此文章
        title: moredata.title, // 文章标题
        time: moredata.datetime, // 文章发表时间
        url: moredata.url, // 文章地址
    };
}