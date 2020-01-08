const axios = require('axios')
const dbAction = require('./index')
var helper = require('../util/helper')

let serverAction = {}

// 接口挂了， 好像是底层错误， 根本不走这里的错误。。。

// 记录错误
serverAction.recordErrNet = async (err, type) => {
    let error, body, status
    error = error.response ? '服务端 - 返回数据失败' : '本地 - 发送请求失败'
    if (err.response) {
        body = err.response.data
        status = err.response.status
    }

    await dbAction.insertOne('error_net', {
        time: helper.nowDATE(),
        type,
        error,
        body,
        status
    }).catch(err => console.log('数据库写入错误'))

    return ({
        error: true
    })
}

serverAction.recordErrDb = async (data) => {
    await dbAction.insertOne('error_net', Object.assign({
        time: helper.nowDATE(),
    }, data))
}

serverAction.getFindAll = async (wx, num = 8) => {
    let resDATA = await axios.get(`https://www.yundiao365.com/crawler/index/publics?&machine_num=${wx}&limit_num=${num}`).catch(async err => {
        return await serverAction.recordErrNet(err, 'getFindAll').catch(err => ({
            error: true
        }))
    })
    if (resDATA.error) return ({ // 请求错误就返回给前台，等10秒后再请求
        nothing: true
    })
    let LinkDATA = resDATA.data.data
    if (!LinkDATA.length) return ({ // 如果数据为空就返回给前台，等10秒后再请求
        nothing: true,
    })
    LinkDATA.map(item => (item.wx = wx, item.gettime = helper.nowDATE()))
    let result = await dbAction.insertMany('find', LinkDATA).catch(err => (console.log(err), {
        result: {
            ok: 0
        }
    }))
    return result.result
}

serverAction.getReadLikeAll = async (wx, num = 60) => {

    let info = await dbAction.findOne('wx', {
        wx: ~~wx,
    }).catch(err => console.log('获取wx数据库失败', err))

    let exact = info.exact
    let newaccount = info.new
    num = newaccount ? 20 : num
    let url_type = exact ? 'exactArticle' : 'articleLinks'

    let resDATA = await axios.get(`https://www.yundiao365.com/crawler/index/${url_type}?machine_num=${wx}&limit_num=${num}`).catch(async err => {
        return await serverAction.recordErrNet(err, 'getReadLikeAll').catch(err => ({
            error: true
        }))
    })
    if (resDATA.error) return ({
        nothing: true
    })
    let LinkDATA = resDATA.data.data
    if (!LinkDATA.length) return ({ // 如果请求失败，或者数据为空，都让前台处理
        nothing: true,
    })
    LinkDATA.map(item => (item.wx = wx, item.gettime = helper.nowDATE()))
    let result = await dbAction.insertMany('readlike', LinkDATA).catch(err => (console.log(err), {
        result: {
            ok: 0
        }
    }))
    return result.result
}


/**
 * 获取单条数据
 */
serverAction.getOne = async (table, query) => {
    let result = await dbAction.findOne(table, query)
    return result
}



/**
 * ---------- 错误记录  ----------
 * data = {
 *  time,  action,  error
 * }
 * return {ok: 1}
 */
serverAction.setError = async (data) => {
    let result = await dbAction.insertOne('error', Object.assign({
        time: helper.nowDATE()
    }, data))
    return result.result
}

/**
 * 设置动作
 */
serverAction.setAction = async (data) => {
    let result = await dbAction.insertOne('action', Object.assign({
        time: helper.nowDATE()
    }, data))
    return result.result
}


/**
 * 获取下一条数据
 */
serverAction.getReadLikeNext = async (wx = 1) => { // 前台页会确保有数据才会执行此方法

    // 是否还有待抓取的数据
    let readLikeDATA = await dbAction.find('readlike', {
        wx,
        finish: {
            $exists: false
        }
    }).catch(err => console.log('查询readlike数据库失败', err))

    // 没有更多数据了
    if (!readLikeDATA.length) {
        serverAction.sendReadLike(wx)
        return ({ // 如果是24小时的
            timeout: true
        })
    }

    // 如果有数据
    let data = readLikeDATA[0]
    let updateResult = await dbAction.updateOne('readlike', { // 更新当前数据为 已完成 状态
        unique: data.unique
    }, {
        finish: 1
    }).catch(err => ({
        error: true
    }))

    if (!data.order_id || !data.msgid || !data.promotion_url) {
        return await serverAction.getReadLikeNext(wx)
    }

    return data
}

serverAction.getFindNext = async (wx) => { // 前台页会确保有数据才会执行此方法
    let result = await dbAction.find('find', {
        wx,
        finish: {
            $exists: false
        }
    }).catch(err => console.log('查询find数据库失败', err))
    if (!result.length) { // 没有更多数据了， 等待一小时后再抓取下一轮
        serverAction.sendFind(wx) // 发送数据到后台
        return ({
            timeout: true
        })
    }
    // 如果有数据
    let data = result[0]
    let updateResult = await dbAction.updateOne('find', { // 更新当前数据为 已完成 状态
        unique: data.unique
    }, {
        finish: 1
    }).catch(err => console.log('更新find数据库失败', err))

    if (!data.biz) {
        return await serverAction.getFindNext(wx)
    }

    return data
}

serverAction.sendReadLike = async (wx) => {
    setTimeout(async () => {

        let data = await dbAction.find('handlereadlike', {
            wx,
            sended: {
                $exists: false
            }
        }).catch(err => console.log('查询handlereadlike数据库失败', err))

        if (!data.length) return

        let sendDATA = []
        data.map(item => {
            if (item.error) {
                sendDATA.push({
                    "msgid": item.msgid,
                    "biz": item.biz,
                    "order_id": item.order_id,
                    "error": item.error,
                    "time": +new Date(item.time) / 1000
                })
            } else {
                sendDATA.push({
                    "order_id": item.order_id,
                    "msgid": item['_post'].mid + '_' + item['_post'].idx,
                    "biz": item['_post'].__biz,
                    "read_num": item.read_num,
                    "like_num": item.like_num,
                    "release_time": item['_post'].ct,
                    "time": +new Date(item.time) / 1000
                })
            }
        })

        let info = await dbAction.findOne('wx', {
            wx: ~~wx
        }).catch(err => console.log('获取wx数据库失败', err))
        let exact = info.exact

        for (var i = 0; i < sendDATA.length; i++) {
            let result = await axios.post('https://www.yundiao365.com/crawler/index/receiveArticle', {
                type: exact ? 3 : 1,
                machine_num: wx,
                data: [sendDATA[i]]
            }).catch(async err => {
                return await serverAction.recordErrNet(err, 'sendHandleReadLike').catch(err => ({
                    error: true
                }))
            })
        }

        let updateHandleReadLike = await dbAction.updateMany('handlereadlike', {
            _id: {
                $lte: data[data.length - 1]._id
            },
        }, {
            sended: true
        }).catch(err => console.log('更新handlereadlike数据库失败', err))

    }, 10000) // 10秒后发送数据 （确保最后一条写入数据库了
}

serverAction.sendFind = async (wx) => {
    setTimeout(async () => {
        let data = await dbAction.find('handlefind', { // 获取还未发送到所有数据
            wx,
            sended: {
                $exists: false
            }
        }).catch(err => console.log('查询handlefind数据库失败', err))

        if (!data.length) return

        let sendDATA = [] // 发送给后台的数据
        data.map(item => {
            let mid = ''
            if (item.data.length) {
                let firstDATA = item.data[0]
                // 获取一下mid, 从有content_url拿到mid

                if (firstDATA.app_msg_ext_info) {
                    if (firstDATA.app_msg_ext_info.content_url != undefined) {
                        let url = firstDATA.app_msg_ext_info.content_url.replace(/amp;/ig, '')
                        if (url) mid = helper.postDATA(url).mid
                    }
                    if (firstDATA.app_msg_ext_info.multi_app_msg_item_list.length) {
                        firstDATA.app_msg_ext_info.multi_app_msg_item_list.map(ftwo => {
                            let suburl = ftwo.content_url.replace(/amp;/ig, '')
                            if (suburl) mid = helper.postDATA(suburl).mid
                        })
                    }
                }


                if (firstDATA.app_msg_ext_info) {
                    if (firstDATA.app_msg_ext_info.content_url != undefined) {
                        let url = firstDATA.app_msg_ext_info.content_url.replace(/amp;/ig, '')
                        sendDATA.push({ // 考虑删文的情况, 就是url没了
                            url: url,
                            msgid: mid + '_1',
                            biz: item.biz,
                            token: item.token,
                            machine_num: item.wx,
                            title: firstDATA.app_msg_ext_info.title,
                            date: firstDATA.comm_msg_info.datetime,
                        })
                    }
                    if (firstDATA.app_msg_ext_info.multi_app_msg_item_list.length) {
                        firstDATA.app_msg_ext_info.multi_app_msg_item_list.map((sub, subidx) => {
                            sendDATA.push({
                                url: sub.content_url.replace(/amp;/ig, ''),
                                msgid: mid + '_' + (subidx + 2),
                                biz: item.biz,
                                token: item.token,
                                machine_num: item.wx,
                                title: sub.title,
                                date: firstDATA.comm_msg_info.datetime,
                            })

                        })
                    }
                }

                console.log(mid, item.biz, 'sss')

            }
        })


        for (var i = 0; i < sendDATA.length; i++) {
            var updateResult = await axios.post('https://www.yundiao365.com/crawler/index/receiveArticleDetail', {
                machine_num: wx,
                data: [sendDATA[i]]
            }).catch(async err => {
                return await serverAction.recordErrNet(err, 'sendHandleFind').catch(err => ({
                    error: true
                }))
            })
        }

        var updateHandleFind = await dbAction.updateMany('handlefind', {
            _id: {
                $lte: data[data.length - 1]._id
            },
        }, {
            sended: true
        }).catch(err => console.log('更新handlefind数据库失败', err))

    }, 10000) // 10秒后发送数据 （确保最后一条写入数据库了


}


module.exports = serverAction;