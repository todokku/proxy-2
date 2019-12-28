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
    let LinkDATA = resDATA.data.data
    if (resDATA.error || !LinkDATA.length) return ({ // 如果请求失败，或者数据为空，都让前台处理
        nothing: true,
    })
    LinkDATA.map(item => item.wx = wx)
    let result = await dbAction.insertMany('find', LinkDATA).catch(err => (console.log(err), {
        result: {
            ok: 0
        }
    }))
    return result.result
}

serverAction.getReadLikeAll = async (wx, num = 60) => {

    let info = await dbAction.findOne('wx', {
        wx
    }).catch(err => console.log('获取wx数据库失败', err))
    let exact = info.exact
    let url_type = exact ? 'exactArticle' : 'articleLinks'

    let resDATA = await axios.get(`https://www.yundiao365.com/crawler/index/${url_type}?machine_num=${wx}&limit_num=60`).catch(async err => {
        return await serverAction.recordErrNet(err, 'getReadLikeAll').catch(err => ({
            error: true
        }))
    })
    let LinkDATA = resDATA.data.data
    if (resDATA.error || !LinkDATA.length) return ({ // 如果请求失败，或者数据为空，都让前台处理
        nothing: true,
    })
    LinkDATA.map(item => (item.wx = wx))
    let result = await dbAction.insertMany('readlike', LinkDATA).catch(err => (console.log(err), {
        result: {
            ok: 0
        }
    }))
    return result.result
}

serverAction.setOne = async (table, data) => {
    let result = await dbAction.insertOne(table, data)
    return result.result
}

serverAction.setMore = async (table, data) => {
    let result = await dbAction.insertMany(table, data)
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
 * 获取所有数据
 */
serverAction.getAll = async (table) => {
    let machineDATA = await serverAction.getOne('info', {})
    let exact = machineDATA.exact
    let wxNum = machineDATA.wx
    let curIndex = machineDATA.index + 1 // 当前第几轮
    // let wxNum = await dbAction.count('wxaccount')
    let url = ''
    var type = '',
        error = '',
        reason = {}

    if (table == 'readlike') {
        if (exact) {
            url = 'https://www.yundiao365.com/crawler/index/exactArticle?machine_num=' + machineDATA.machine + '&limit_num=' + (~~wxNum * 60) // 24小时的应该不用做限制
            type = '24小时文章阅读数'
        } else {
            url = 'https://www.yundiao365.com/crawler/index/articleLinks?machine_num=' + machineDATA.machine + '&limit_num=' + (~~wxNum * 60)
            type = '文章阅读数'
        }
    }
    if (table == 'find') {
        url = 'https://www.yundiao365.com/crawler/index/publics?&machine_num=' + machineDATA.machine + '&limit_num=' + (~~wxNum * 8)
        type = '公众号主页'
    }



    let resDATA = await axios.get(url).catch(err => {

        if (!err.response) error = '本地-发送请求失败'
        if (err.response) {
            error = '服务端-返回数据失败'
            reason = {
                body: err.response.data,
                status: err.response.status
            }
        }
        dbAction.insertOne('error_net', {
            time: helper.nowDATE(),
            action: '请求数据',
            type,

            error,
            reason
        })
        return ({
            err: 1
        })

    })

    if (resDATA.err) { // 如果出错了就再次请求数据哦。---
        return await serverAction.getAll(table)
    }


    let DATA = resDATA.data.data

    if (!DATA.length) { // 如果没有数据， 直接返回结果
        await serverAction.setError({
            action: 'getALL_' + table,
            error: '暂无数据'
        })

        // 如果没数据了， 就返回给前台的跳转页（下一轮的数据也是由前台页获取） 
        return ({
            nothing: 1,
        })
    }


    let nowtime = +new Date

    dbAction.updateOne('info', {}, {
        index: curIndex
    })

    let result = await dbAction.insertMany(table, helper.cut(DATA, wxNum, nowtime, curIndex))

    return result.result // {ok: 1, n: 3} n=>影响的行数
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
 * 记录微信个数
 */
serverAction.setWx = async (num) => {
    new Array(~~num).fill(~~num).map(async (item, index) => {
        await dbAction.findOneAndUpdate('wxaccount', {
            wx: index + 1
        }, {
            wx: index + 1,
            index: 0,
            used: false
        })
    })
    return true
}

serverAction.setAddWx = async (num) => {
    let wxaccount = await dbAction.count('wxaccount');
    new Array(~~num).fill(~~num).map(async (item, index) => {
        await dbAction.findOneAndUpdate('wxaccount', {
            wx: wxaccount + index + 1
        }, {
            wx: wxaccount + index + 1,
            index: 0,
            used: false
        })
    })
}

/**
 * 更新单个微信的使用记录， 
 */
serverAction.setWxAccount = async (query, data) => {
    let result = await dbAction.updateOne('wxaccount', query, data)
    return result.result
}

/**
 * 更新微信，当前微信被干掉了
 * type: 'find' / 'readlike'
 */
serverAction.updateWx = async (wx, type) => {

    // 获取所有未使用微信号记录
    let wxDATA = await dbAction.find('wxaccount', {
        wx,
        used: false
    })

    if (wxDATA.length) {
        let nextWx = wxDATA[0]
        let result = await dbAction.updateMany(type, {
            wx
        }, {
            wx: nextWx.wx
        })
        // 更新微信信息
        await serverAction.setWxAccount({
            wx: nextWx,
        }, {
            used: true
        })
        return result.result // 返回ok
    } else {
        await serverAction.setError({
            action: 'updateWx',
            error: '没有更多微信咯'
        })
        return ({
            nothing: 1,
        })
    }
}

/**
 * 获取开始时间
 * return => null || {_id, wx, time}
 * -----------------------------------------待处理， 如果数据库请求错误， 就返回当前时间 - 2分钟 ? ---
 */
serverAction.getRecordTime = async (query) => {
    let result = await dbAction.findOne('wxaccount', query)
    return result
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

    return data

    // 上一条数据
    // let predata = await dbAction.findAll('readlike', {
    //     wx,
    //     finish: 1
    // })
    // if (updateResult.error) { // 重要， 如果状态没有更新成功，会导致下一次还取到当条数据，导致上下数据一致，微信处死循环。 (待议)
    //     // 在来一次
    //     return await serverAction.getReadLikeNext(wx)
    // }
    // if (predata.length && predata[0].promotion_url == data.promotion_url) { // 如果上一条链接 == 当前条链接则跳过
    //     return await serverAction.getReadLikeNext(wx)
    // }


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
    return data
}

serverAction.sendReadLike = async (wx) => {
    setTimeout(async () => {

        let data = await dbAction.find('handlereadlike', {
            sended: {
                $exists: false
            }
        }).catch(err => console.log('查询handlereadlike数据库失败', err))

        if (!data.length) return

        let newDATA = []
        data.map(item => {
            if (item.error) {
                newDATA.push({
                    "msgid": item.msgid,
                    "biz": item.biz,
                    "order_id": item.order_id,
                    "error": item.error,
                    "time": +new Date(item.time) / 1000
                })
            } else {
                newDATA.push({
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
            wx
        }).catch(err => console.log('获取wx数据库失败', err))
        let exact = info.exact

        let result = await axios.post('https://www.yundiao365.com/crawler/index/receiveArticle', {
            type: exact ? 3 : 1,
            machine_num: wx,
            data: newDATA
        }).catch(async err => {
            return await serverAction.recordErrNet(err, 'sendHandleReadLike').catch(err => ({
                error: true
            }))
        })

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



        for (var i = 0; i <= sendDATA.length; i++) {
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