const exec = require('child_process').exec
const axios = require('axios')
const dbAction = require('../mongodb/index')
const serverAction = require('../mongodb/serverdata')
const helper = require('../util/helper')

const process = {}
const types = {
    readlike: 1,
    find: 2,
    exact: 3,
}

process.processing = () => {
    console.log('---------- 开始监听微信客户端进程 ----------')
    let timer = setInterval(async () => {
        // 判断下数据库是否有pid了
        let wxInfo = await dbAction.findAll('wx')

        if (!wxInfo.length) return // 如果没数据就不执行命令行操作
        // 否则，有wxInfo数据必然有pid（因为必须通过登录微信打开相应的链接才会写入wxInfo数据
        exec('tasklist | findstr "WeChatApp"', async (err, stdout) => {
            if (err) { // 全部掉线
                clearInterval(timer) //
                let wxDATA = await dbAction.findAll('wx')
                wxDATA.map(async item => {
                    if (item.pid) {
                        if (item.type == 'find') await serverAction.getFindAll(item.wx, 0).catch(err => {})
                        if (item.type == 'readlike') await serverAction.getReadLikeAll(item.wx, 0).catch(err => {})

                        await dbAction.findOneAndUpdate('wx', {
                            wx: item.wx
                        }, {
                            pid: null
                        }).catch(err => console.log(err, '更新账号信息失败'))

                        let type = item.exact ? 3 : types[item.type]

                        await axios.get(`https://www.yundiao365.com/crawler/index/gameOver?machine_num=${item.wx}&type=${~~type}`).catch(async err => {
                            return await serverAction.recordErrNet(err, 'sendGameOver').catch(err => ({
                                error: true
                            }))
                        })
                    }
                })
                // 

                return
            }
            let pids = [] //通过命令行拿到的pids
            let wxDATA = await dbAction.findAll('wx'),
                wxPids = [] //数据库中的pids
            wxDATA.forEach(item => { // 数据存在的pid
                if (item.pid) wxPids.push(item.pid)
            })
            stdout.split('\n').forEach(item => { // 进程有的pid
                let newitem = item.trim().split(/\s+/)[1]
                if (newitem) pids.push(newitem)
            })
            if (pids.length < wxPids.length) { // 命令行的进程 小于 数据库本该有的进程
                wxDATA.map(async item => {
                    if (item.pid) {
                        if (!pids.includes(item.pid)) {
                            item.pid = null
                            // 发送短信。告知掉线了
                            await dbAction.findOneAndUpdate('wx', {
                                wx: item.wx
                            }, {
                                pid: null
                            }).catch(err => console.log(err, '更新账号信息失败'))

                            let type = item.exact ? 3 : types[item.type]

                            await axios.get(`https://www.yundiao365.com/crawler/index/gameOver?machine_num=${item.wx}&type=${~~type}`).catch(async err => {
                                return await serverAction.recordErrNet(err, 'sendGameOver').catch(err => ({
                                    error: true
                                }))
                            })
                        }
                    }
                })
            }
        })
    }, 5 * 60 * 1000) // 5分钟查询一次是否还登录
}

process.getPid = async () => {
    return new Promise((resolve, reject) => {
        exec('tasklist | findstr "WeChatApp"', async (err, stdout) => {
            if (err) { // 这个错误肯定不会运行哦（因为客户端掉了， 此方法也不运行了）除非改进程名字了.那是另一件事了...
                return resolve({
                    error: true // 木有运行微信客户端哦
                })
            }
            let pids = [] //通过命令行拿到的pids
            let wxDATA = await dbAction.findAll('wx'),
                wxPids = [] //数据库中的pids
            let newPid = [] //跟数据库比对后未使用的pid
            wxDATA.forEach(item => {
                if (item.pid) wxPids.push(item.pid)
            })
            stdout.split('\n').forEach(item => { // 获取进程所有的wx pids
                let newitem = item.trim().split(/\s+/)[1]
                if (newitem) pids.push(newitem)
            })
            if (pids.length) { // 拿到不存在数据库中的pid
                pids.forEach(item => {
                    if (!wxPids.includes(item)) {
                        newPid.push(item)
                    }
                })
            }
            if (newPid.length) {
                resolve({
                    pid: newPid[0]
                })
            } else {
                resolve({
                    error: true // （没有找到新的微信客户端哦
                })
            }
        })
    })
}

module.exports = process