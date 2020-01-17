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

serverAction.getFindAll = async (wx, num = 4) => {

    // 18-8点: 4 * 14
    // 8-18点：14 * 10
    let night = [0, 1, 2, 3, 4, 5, 6, 7, 19, 20, 21, 22, 23]
    let hour = new Date().getHours()
    num = night.includes(hour) ? 4 : 14

    let resDATA = await axios.get(`https://www.yundiao365.com/crawler/index/publics?&machine_num=${wx}&limit_num=${num}`).catch(async err => {
        return await serverAction.recordErrNet(err, 'getFindAll').catch(err => ({
            error: true
        }))
    })

    if (resDATA.error) return ({ // 请求错误就返回给前台，等10秒后再请求
        nothing: true
    })

    if (!resDATA.error) {
        // 记录发送数据结果
        await dbAction.insertOne('get_net', {
            time: helper.nowDATE(),
            wx,
            num,
            type: 'getFindAll',
            resdata: resDATA.data,
            resstatus: resDATA.status,

        }).catch(err => console.log('数据库写入错误'))
    }



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

    wx = ~~wx

    let info = await dbAction.findOne('wx', {
        wx,
    }).catch(err => console.log('获取wx数据库失败', err))

    let readlike = await dbAction.findAll('readlike', {
        wx
    })
    let over2 = 0
    if (readlike.length) {
        readlike.map(data => {
            let pastTime = (+new Date(data.handle_time) - data.ct) / 1000 // 秒
            if (pastTime >= 7200) over2 += 1 //如果超过2小时的 +1
            if (data.del) over2 += 1 // 如果文章违规删文等
        })
    }

    over2 = over2 > 120 ? 120 : over2

    let exact = !!info ? info.exact : 0
    let newaccount = !!info ? info.new : 20
    num = newaccount ? 20 : num + over2
    let url_type = exact ? 'exactArticle' : 'articleLinks'

    let resDATA = await axios.get(`https://www.yundiao365.com/crawler/index/${url_type}?machine_num=${wx}&limit_num=${num}`).catch(async err => {
        return await serverAction.recordErrNet(err, 'getReadLikeAll').catch(err => ({
            error: true
        }))
    })
    if (resDATA.error) return ({
        nothing: true
    })
    if (!resDATA.error) {
        // 记录发送数据结果
        await dbAction.insertOne('get_net', {
            time: helper.nowDATE(),
            wx,
            type: 'getFindReadLike',
            num,
            resdata: resDATA.data,
            resstatus: resDATA.status,
        }).catch(err => console.log('数据库写入错误'))
    }

    let LinkDATA = resDATA.data.data
    if (!LinkDATA.length) { // 如果数据为空，都让前台处理
        await dbAction.remove('readlike', {
            wx
        }).catch(async err => console.log(err, '清空数据出错'))
        return ({
            nothing: true,
        })
    }

    // 如果数据库的order_id不在当前次的数据中的话， 则删除
    let prevReadLikeData = await dbAction.findAll('readlike', {
        wx
    })
    let waitDelOrderIds = []
    let waitDelOrderIdsForRecord = []
    if (prevReadLikeData.length) {
        for (let i = 0; i <= prevReadLikeData.length - 1; i++) {
            let prdOne = prevReadLikeData[i];
            let hasPrdOneData = LinkDATA.find(item => item.order_id == prdOne.order_id)
            if (!hasPrdOneData) {
                waitDelOrderIds.push(prdOne.order_id)
                waitDelOrderIdsForRecord.push({
                    order_id: prdOne.order_id,
                    wx,
                    time: helper.nowDATE(),
                })
            }
        }
        if (waitDelOrderIds.length) {
            let delOldDatas = await dbAction.deleteMany('readlike', {
                wx,
                order_id: {
                    $in: waitDelOrderIds
                }
            }).catch(async err => console.log(err, '删除上一条数据失败'))
            let recordDelData = await dbAction.insertMany('del_prev_readlike', waitDelOrderIdsForRecord).catch(err => console.log(err, '记录删除上一条数据失败'))
        }
        return await serverAction.writeReadLikeDB(wx, LinkDATA)
    } else {
        return await serverAction.writeReadLikeDB(wx, LinkDATA)
    }
}


serverAction.writeReadLikeDB = async (wx, data, i = 0) => {
    let dataOne = data[i]
    dataOne.wx = wx
    dataOne.finish = 0

    let hasData = await dbAction.findOne('readlike', {
        wx,
        order_id: dataOne.order_id
    }).catch(async err => console.log('查询失败'))

    if (hasData === null) { // 如果没找到对应数据
        await dbAction.findOneAndUpdate('readlike', {
            wx,
            order_id: dataOne.order_id,
        }, Object.assign(dataOne, {
            get_time: helper.nowDATE(),
            update_time: helper.nowDATE()
        }))
    } else {
        await dbAction.findOneAndUpdate('readlike', {
            wx,
            order_id: dataOne.order_id,
        }, {
            update_time: helper.nowDATE()
        })
    }

    // await dbAction.findOneAndUpdate('readlike', {
    //     order_id: dataOne.order_id,
    // }, dataOne)



    if (i >= data.length - 1) {
        return ({
            ok: true
        })
    } else {
        return await serverAction.writeReadLikeDB(wx, data, i + 1)
    }
    // if (hasData.result)
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
serverAction.getReadLikeNext = async (wx) => { // 前台页会确保有数据才会执行此方法

    // 是否还有待抓取的数据
    let readLikeDATA = await dbAction.find('readlike', {
        wx,
        finish: 0
    }).catch(err => console.log('查询readlike数据库失败', err))

    // 没有更多数据了
    if (!readLikeDATA.length) {

        await dbAction.updateMany('readlike', {
            wx,
        }, {
            finish: 0
        }).catch(async err => console.log('重设标志为未完成失败'))

        serverAction.sendReadLike(wx)
        return ({ // 如果是24小时的
            timeout: true
        })
    }
    // 如果有数据
    let data = readLikeDATA[0]

    if (data.ct) { // 如果存在ct(有抓过， 然后有发文时间了)
        let pastTime = (+new Date - +new Date(data.ct)) / 1000 // 秒
        if (pastTime >= 7200) { // 如果发文超过两个小时了
            if ((+new Date - +new Date(data.handle_time)) / 1000 < 1800) { // 如果没有超过30分钟
                await dbAction.updateOne('readlike', { // 更新当前数据为 已完成 状态
                    _id: data._id
                }, {
                    finish: 1,
                }).catch(err => {
                    console.log(err, '更新finish标志失败')
                    return ({
                        error: true
                    })
                })
                return await serverAction.getReadLikeNext(wx) // 则跳过取下一个
            }
        }
    }

    let updateResult = await dbAction.updateOne('readlike', { // 更新当前数据为 已完成 状态
        _id: data._id
    }, {
        finish: 1,
        handle_time: helper.nowDATE()
    }).catch(err => ({
        error: true
    }))
    if (data.del || !data.order_id || !data.msgid || !data.promotion_url) {
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
        _id: data._id
    }, {
        finish: 1
    }).catch(err => console.log('更新find数据库失败', err))

    if (!data.biz) {
        return await serverAction.getFindNext(wx)
    }

    return data
}

serverAction.sendReadLikeSingle = async (sendDATA, type, wx, i = 0) => {

    let result = await axios.post('https://www.yundiao365.com/crawler/index/receiveArticle', {
        type: type,
        machine_num: wx,
        data: [sendDATA[i]]
    }).catch(async err => {
        return await serverAction.recordErrNet(err, 'sendHandleReadLike').catch(err => ({
            error: true
        }))
    })

    if (!result.error) { // 记录发送数据结果
        await dbAction.insertOne('send_net', {
            time: helper.nowDATE(),
            wx,
            senddata: sendDATA[i],
            type: 'sendReadLike',
            resdata: result.data,
            resstatus: result.status,

        }).catch(err => console.log('数据库写入错误'))
    }

    if (i >= sendDATA.length - 1) {
        return true
    } else {
        return await serverAction.sendReadLikeSingle(sendDATA, type, wx, i + 1)
    }
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

        let exact = !!info ? info.exact : 0
        let type = exact ? 3 : 1

        // for (var i = 0; i < sendDATA.length; i++) {
        //     let result = await axios.post('https://www.yundiao365.com/crawler/index/receiveArticle', {
        //         type: exact ? 3 : 1,
        //         machine_num: wx,
        //         data: [sendDATA[i]]
        //     }).catch(async err => {
        //         return await serverAction.recordErrNet(err, 'sendHandleReadLike').catch(err => ({
        //             error: true
        //         }))
        //     })

        //     if (!result.error) {
        //         // 记录发送数据结果
        //         await dbAction.insertOne('send_net', {
        //             time: helper.nowDATE(),
        //             wx,
        //             senddata: sendDATA[i],
        //             type: 'sendReadLike',
        //             resdata: result.data,
        //             resstatus: result.status,

        //         }).catch(err => console.log('数据库写入错误'))
        //     }
        // }

        await serverAction.sendReadLikeSingle(sendDATA, type, wx)

        let updateHandleReadLike = await dbAction.updateMany('handlereadlike', {
            wx,
            _id: {
                $lte: data[data.length - 1]._id
            },
        }, {
            sended: true
        }).catch(err => console.log('更新handlereadlike数据库失败', err))

    }, 10000) // 10秒后发送数据 （确保最后一条写入数据库了
}

serverAction.sendFindSingle = async (sendDATA, wx, i = 0) => {

    var result = await axios.post('https://www.yundiao365.com/crawler/index/receiveArticleDetail', {
        machine_num: wx,
        data: [sendDATA[i]]
    }).catch(async err => {
        return await serverAction.recordErrNet(err, 'sendHandleFind').catch(err => ({
            error: true
        }))
    })

    if (!result.error) {
        // 记录发送数据结果
        await dbAction.insertOne('send_net', {
            time: helper.nowDATE(),
            wx,
            senddata: sendDATA[i],
            type: 'sendFind',
            resdata: result.data,
            resstatus: result.status,

        }).catch(err => console.log('数据库写入错误'))
    }

    if (i >= sendDATA.length - 1) {
        return true
    } else {
        return await serverAction.sendFindSingle(sendDATA, wx, i + 1)
    }

}
serverAction.sendFind = async (wx) => {
    setTimeout(async () => {
        let data = await dbAction.find('handlefind', { // 获取还未发送到所有数据
            wx: wx,
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
            }
        })

        await serverAction.sendFindSingle(sendDATA, wx)


        // for (var i = 0; i < sendDATA.length; i++) {
        //     var result = await axios.post('https://www.yundiao365.com/crawler/index/receiveArticleDetail', {
        //         machine_num: wx,
        //         data: [sendDATA[i]]
        //     }).catch(async err => {
        //         return await serverAction.recordErrNet(err, 'sendHandleFind').catch(err => ({
        //             error: true
        //         }))
        //     })

        //     if (!result.error) {
        //         // 记录发送数据结果
        //         await dbAction.insertOne('send_net', {
        //             time: helper.nowDATE(),
        //             wx,
        //             senddata: sendDATA[i],
        //             type: 'sendFind',
        //             resdata: result.data,
        //             resstatus: result.status,

        //         }).catch(err => console.log('数据库写入错误'))
        //     }
        // }
        var updateHandleFind = await dbAction.updateMany('handlefind', {
            wx,
            _id: {
                $lte: data[data.length - 1]._id
            },
        }, {
            sended: true
        }).catch(err => console.log('更新handlefind数据库失败', err))

    }, 10000) // 10秒后发送数据 （确保最后一条写入数据库了


}


module.exports = serverAction;