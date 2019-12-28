var express = require('express')
var router = express.Router()

var dbAction = require('../mongodb/index')
var serverAction = require('../mongodb/serverdata')
var process = require('../process/index')

router.get('/find', async function (req, res, next) {
    let action = req.query.action
    let wx = ~~req.query.wx
    let nextLink = {}
    if (!wx) {
        return res.render('find', {
            type: 'error',
            wx,
            nextLink
        })
    }

    if (!action) { // 第一次进入(包含关掉页面重新点击链接进入)

        let updateDATA = {
            wx,
            type: 'find',
            pid: null
        }

        // 删除pid
        await dbAction.findOneAndUpdate('wx', {
            wx
        }, updateDATA).catch(err => console.log('写入wx数据库失败', err))

        let newPid = await process.getPid()
        if (!newPid.error) { // 如果不是错误 
            updateDATA.pid = newPid.pid
        }
        await dbAction.findOneAndUpdate('wx', {
            wx
        }, updateDATA).catch(err => console.log('写入wx数据库失败', err))

        let findDATA = await dbAction.find('find', {
            wx
        }).catch(err => console.log('查询find数据库失败', err))

        if (!findDATA.length) type = 'nothing'

        if (findDATA.length) { // 如果有此微信数据
            nextLink = await serverAction.getFindNext(wx).catch(err => console.log('查询find数据库失败', err))
            dbAction.findOneAndUpdate('wx', {
                wx
            }, {
                historytime: +new Date
            })
            if (nextLink.timeout) {
                type = 'timeout'
            } else {
                type = 'canNext'
            }
        }
    }

    if (action && action == 'nothing') { // 如果是没数据的情况
        var findDATA = await serverAction.getFindAll(wx).catch(err => console.log('查询find数据库失败', err)) // 获取下一轮数据

        if (!findDATA.nothing || findDATA.ok) {
            nextLink = await serverAction.getFindNext(wx).catch(err => console.log('查询find数据库失败', err))
            dbAction.findOneAndUpdate('wx', {
                wx
            }, {
                historytime: +new Date
            })
            if (nextLink.timeout) {
                type = 'timeout'
            } else {
                type = 'canNext'
            }
        } else {
            type = 'nothing'
        }
    }
    if (action && action == 'timeout') {
        type = 'timeout'
    }
    res.render('find', {
        type,
        wx,
        nextLink
    })
})




router.get('/readlike', async function (req, res, next) {

    let action = req.query.action
    let wx = ~~req.query.wx
    let exact = ~~req.query.exact
    let timeout = false

    if (!wx) {
        return res.render('readlike', {
            type: 'error',
            wx,
        })
    }

    if (!action) { // 第一次进入(包含关掉页面重新点击链接进入)

        let updateDATA = {
            wx,
            type: 'readlike',
            exact,
            pid: null
        }

        // 删除pid
        await dbAction.findOneAndUpdate('wx', {
            wx
        }, updateDATA).catch(err => console.log('写入wx数据库失败', err))

        let newPid = await process.getPid()
        if (!newPid.error) { // 如果不是错误 
            updateDATA.pid = newPid.pid
        }
        await dbAction.findOneAndUpdate('wx', {
            wx
        }, updateDATA).catch(err => console.log('写入wx数据库失败', err))

        let readLikeDATA = await dbAction.find('readlike', { // 如果此微信有数据(直接获取是否有未完成的数据，不同于find需要比较久的时间等待哦)
            wx,
            finish: {
                $exists: false
            }
        }).catch(err => console.log('查询readlike数据库失败', err))

        type = readLikeDATA.length ? 'canNext' : 'nothing'
    }
    if (action && action == 'nothing') { // 如果是没数据的情况
        let readLikeDATA = await serverAction.getReadLikeAll(wx).catch(err => console.log('查询handle数据库失败', err))
        // 设置微信的使用情况
        if (!readLikeDATA.nothing || readLikeDATA.ok) {
            await dbAction.findOneAndUpdate('wx', {
                wx
            }, {
                articletime: +new Date
            }).catch(err => console.log('写入wx数据库失败', err))

            type = 'canNext'
        } else {
            type = 'nothing'
        }
    }

    if (action && action == 'timeout') {

        type = 'timeout'

        let wxDATA = await dbAction.findOne('wx', {
            wx
        }).catch(err => console.log('读取wx数据库失败', err))
        timeout = 10 * 60 * 1000 - (+new Date - wxDATA.articletime)

        if (timeout <= 10000) { // 如果小于10秒则不倒计时了
            type = 'nothing'
        }
    }

    res.render('readlike', {
        timeout,
        type,
        wx,
        exact,
    })
})

module.exports = router