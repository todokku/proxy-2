const axios = require('axios')
const dbAction = require('./index')

var serverAction = {}

serverAction.cut = (data, num) => {
    var tmpArr = []
    for (var i = 0; i < data.length; i += Math.ceil(data.length / num)) {
        tmpArr.push(data.slice(i, i + Math.ceil(data.length / num)))
    }
    var newArr = tmpArr.map((item, index) => {
        item.map(val => (val.wx = index + 1, val.time = +new Date))
        return item
    })
    return newArr.flat()
}


serverAction.setWx = async (num) => {
    let wxdata = new Array(~~num).fill(~~num).map((item, index) => ({
        wx: index + 1,
        used: false
    }))
    let result = await dbAction.insertMany('record', wxdata)
    return result.result
}

serverAction.getReadLikeAll = async () => {
    // return await axios.get('http://yundiao.web.xmchuangyi.com/crawler/index/articleLinks')
    let readLikeDATA = [{
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654419&idx=1&sn=d00609e9d5241a989ed94c218bae657d&chksm=bd156b448a62e2527f8c0e73ce7f42bcd2ca8360a94d7c17cfb43b606dde5917e2cd87193fb0&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654419&idx=2&sn=6b556fd246a03c4209b8e7039f33a84d&chksm=bd156b448a62e25263df9b01f9474c67776b16d607f041a7ad8f13374120e3b77bd6e2019d45&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654419&idx=3&sn=f14d44affcbd69574ac69354b931e553&chksm=bd156b448a62e252ff2f4daa59d433b48ef5b8839150adcb08e4387105200eefe72b69e3c8a0&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654419&idx=4&sn=417e3b104ec00064806a0492e12165c0&chksm=bd156b448a62e25213ac1e3fddfc5d8fc84a1f27eca2289c75c9cd007de3573ca7a22f811c04&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654419&idx=5&sn=8887476fcb3cf66b237bf0c6d9e4e9b9&chksm=bd156b448a62e2520c74a1b4296d8200927c4069ea26d9e28f12db59f0d857d58642b8e6bec1&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654419&idx=6&sn=c3f073630b6315017301d6fb557c92fb&chksm=bd156b448a62e252988a78bfa9690b1154af95a4e739da6bcf03e10c52b377bd4109afdcd106&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654409&idx=1&sn=583d3f94e3ecf0d4ea5a48210e4cb908&chksm=bd156b5e8a62e248e988cc92ba11484558292402ed8c9ed7fde3f6118951ad561059f413f379&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654409&idx=2&sn=f06bf621b8dfa903df1d606f7163f69c&chksm=bd156b5e8a62e248b32a50288785e36a2ab7047cb840045e7da36781edccf86f81871304f68c&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654409&idx=3&sn=8733711a3849fe725b406ed2edc5582e&chksm=bd156b5e8a62e248bf0cc8f24fdc440de6f8ced707c41703a07cb00a3d03a4070d4d1f29907c&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654409&idx=4&sn=59f7454c4629b4ec37cb87f6cccb4af9&chksm=bd156b5e8a62e248fe1091b3dd50c1a187c2b582d2ddadf174850b50f9d6a4aa325bc08ceaf4&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654409&idx=5&sn=d0a90adbd961f51637dce149cfb76e1b&chksm=bd156b5e8a62e248a20b7ca6ee912ccfa6f24ad0f598d76dd404d264d89fb45b9b3fa62fcd8b&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654409&idx=6&sn=a2e4e532d910d37bfbd4012d9faec9f5&chksm=bd156b5e8a62e24840bf076fa53cc48ef7a76050f99a4787d99cf7ff92670a5e4bd8185606c8&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654401&idx=1&sn=aebbfd07c6c4bf11986de2abbd8202c8&chksm=bd156b568a62e240da0d0ebcf3d9cb3734f1aaceaac9b22421b00cfd439b4d607e652fc5128f&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654401&idx=2&sn=241c86009a44ae071c2363d341c12e41&chksm=bd156b568a62e240212218b13d8dae147cfbc83ed779274f5c54e7aefd0cb56d6fbbed596582&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654401&idx=3&sn=31a51d5b76fa6f0d666c1bdfd7566eac&chksm=bd156b568a62e2400e69edd08f4235cb1d3cccd37a57011a361841202b77dbfe8ab00509366b&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654401&idx=4&sn=b40e5a7d7f9559b7e439c087591aa361&chksm=bd156b568a62e2401396fa51c2682b30dec8b6d3621b557a5a93cae4993fd415eeb86cbbc0c7&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654401&idx=5&sn=5de45a3ae41a9265199a5e663bcb21ab&chksm=bd156b568a62e24066e040331241e7a62ac43d485e13b83f0eee885c9a8a0a6f35c338e5107c&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654401&idx=6&sn=76a4acb8b3c272c28edca2026635cc46&chksm=bd156b568a62e240b10aa251093d6d1bd89a2ddb2ee410c93b6e43c90289217552898a10c8b7&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654391&idx=1&sn=ebb35488990c93f2e24450017223f25d&chksm=bd156aa08a62e3b6f7e6ac930d9bb5c15635cc9c52fef047399398c69ddb7b6200155adc9b4e&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654391&idx=2&sn=907b47c218fb45856615f2b227b0bc55&chksm=bd156aa08a62e3b67c01724fe3511d260b63d3bbb962dfc86368fdf311f08b0bf8c981f67811&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654391&idx=3&sn=83c8c323e5d3430466eb30a5c03a47ba&chksm=bd156aa08a62e3b6ff725a56fbd798afbc0572cdd6384ec07c2fc408a737364b6cf460482655&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654391&idx=4&sn=8d1bff9b76534b50dea74522c80126d6&chksm=bd156aa08a62e3b6de8651f8ad273383faf129eac3f0d67a37aec4cb579f8ec975bdd29b6b87&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654391&idx=5&sn=e8a6469bd47e1ab54d140d44013170a4&chksm=bd156aa08a62e3b6295317f45b1236d5603fbbc146232774e601fe4ae966de2b77dea2be1859&scene=27#wechat_redirect"
    }, {
        "id": Math.random().toString(16).substr(2),
        "promotion_url": "http://mp.weixin.qq.com/s?__biz=MjM5NjIwNjM5Mg==&mid=2651654391&idx=6&sn=5561c0d9219bdd5171a1347d00e6371f&chksm=bd156aa08a62e3b6af341c9a7981ba00643e0ed510bb7f765b6e2f414d4b3cb6ddc0de78fe75&scene=27#wechat_redirect"
    }]

    let num = await dbAction.count('record')
    // let result = await dbAction.insertMany('readlike', serverAction.cut(readLikeDATA, Math.ceil(num / 2)))
    let result = await dbAction.insertMany('readlike', serverAction.cut(readLikeDATA, 1))
    return result.result // {ok: 1, n: 3} n=>影响的行数
}

serverAction.getFindAll = async () => {
    // let findDATA = axios.get('http://yundiao.web.xmchuangyi.com/crawler/index/publics')
    let findDATA = [{
        "id": Math.random().toString(16).substr(2),
        biz: 'MzAxODc5MDQzNA==',
        title: '好好笑哦',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzAxMDU4OTM3Nw==',
        title: '比肉还想',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzU5NTM3NjAzNw==',
        title: '比肉还想1',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MjM5NzI1MTY0MQ==',
        title: '比肉还想2',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MjM5MjgwNTQ1MQ==',
        title: '女子刮出百万大奖，兑奖时却尴尬了…',
        pos: 3, // 位置
        time: 1573791296, //
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzU4NDc3MjIyMw==',
        title: '《犯罪心理》中那些经典的案子（二）',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzA5NTExODU1OQ==',
        title: '比肉还想3',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzA5NTIyMjQzNg==',
        title: '比肉还想4',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzU4NDc3MjIyMw==',
        title: '比肉还想5',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzIxMjYwMDI5Nw==',
        title: '比肉还想6',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzUxMjAwNTAwMw==',
        title: '比肉还想7',
        pos: 2,
        time: 1573193820
    }, {
        "id": Math.random().toString(16).substr(2),
        biz: 'MzAwODY4OTk2Mg==',
        title: '比肉还想8',
        pos: 2,
        time: 1573193820
    }]


    let num = await dbAction.count('record')

    // let result = await dbAction.insertMany('find', serverAction.cut(findDATA, Math.ceil(num / 2)))
    let result = await dbAction.insertMany('find', serverAction.cut(findDATA, 1))
    return result.result // {ok: 1, n: 3} n=>影响的行数
}

serverAction.setRecordTime = async (query, data) => {
    let result = await dbAction.updateOne('record', query, data)
    return result.result
}

/**
 * 获取开始时间
 * return => null || {_id, wx, time}
 */
serverAction.getRecordTime = async (query) => {
    let result = await dbAction.findOne('record', query)
    return result
}

/**
 * 获取下一条数据
 */

serverAction.getReadLikeNext = async (wx = 1) => {
    // 先判断是否有对应的wx数据， 用来wx等待
    let exist = await dbAction.find('readlike', {
        wx,
    })
    if (!exist.length) return {} // 如果没有这个wx数据，就返回( wx数据 => 每次获取到数据会对数据进行分配对应的微信号 )
    let result = await dbAction.find('readlike', {
        wx,
        finish: {
            $exists: false
        }
    })
    if (!result.length) { // 没有更多数据了
        // 是否1分钟了
        let recordTimeResult = await serverAction.getRecordTime({
            wx,
        })
        // if (recordTimeResult == null)  // 没有取到时间数据
        let nowTime = +new Date
        if (nowTime - recordTimeResult.articletime < 10 * 60 * 1000) { // 如果执行完用时不超过1分钟

            return await new Promise((resolve, reject) => {
                console.log(`
                
                -----------------
                我正在等待下一次重新获取数据
                -----------------


                `)
                let timer = setTimeout(async () => {
                    clearTimeout(timer)
                    let allResult = await serverAction.getReadLikeAll()
                    if (!allResult.ok) resolve({
                        err: '重新请求后端数据失败'
                    })

                    console.log(`
        
                    -----------------
                    我在等二分钟后才返回哦（意味着最后一篇文章会很久以后才刷新
                    -----------------
                    
                    `)

                    // 更新时间
                    let recordTimeResult = await serverAction.setRecordTime({
                        wx: ~~wx,
                    }, {
                        used: true,
                        articletime: +new Date,
                    })

                    if (!recordTimeResult.ok) resolve({
                        err: '重新记录“开始时间”失败'
                    })

                    resolve(await serverAction.getReadLikeNext(wx))

                }, 10 * 60 * 1000 - (nowTime - recordTimeResult.articletime))
            })
        } else { // 如果超过5分钟了就重新开始哦
            let allResult = await serverAction.getReadLikeAll()
            if (!allResult.ok) return {
                err: '重新请求后端数据失败'
            }
            return await serverAction.getReadLikeNext(wx)
        }
    }

    // 如果有数据
    let data = result[0]
    let updateResult = await dbAction.updateOne('readlike', { // 更新当前数据为 已完成
        id: data.id
    }, {
        finish: 1
    })
    if (!updateResult.result.ok) return {
        err: '更新当前数据为“已完成”状态失败'
    }
    return data
}


serverAction.getFindNext = async (wx = 1) => {

    // 

    // 先判断是否有对应的wx数据， 用来wx等待
    let exist = await dbAction.find('find', {
        wx,
    })
    if (!exist.length) return {} // 如果没有这个wx数据，就返回( wx数据 => 每次获取到数据会对数据进行分配对应的微信号 )
    let result = await dbAction.find('find', {
        wx,
        finish: {
            $exists: false
        }
    })
    if (!result.length) { // 没有更多数据了
        // 是否1分钟了
        let recordTimeResult = await serverAction.getRecordTime({
            wx,
        })
        // if (recordTimeResult == null)  // 没有取到时间数据
        let nowTime = +new Date
        if (nowTime - recordTimeResult.historytime < 10 * 60 * 1000) { // 如果执行完用时不超过1分钟
            return await new Promise((resolve, reject) => {


                console.log(`
                
                -----------------
                我正在等待下一次重新获取数据
                -----------------


                `)


                let timer = setTimeout(async () => {
                    clearTimeout(timer)
                    let allResult = await serverAction.getFindAll()
                    if (!allResult.ok) resolve({
                        err: '重新请求后端数据失败'
                    })

                    console.log(`
        
                    -----------------
                    我在等一分钟后才返回哦（意味着最后一篇文章会很久以后才刷新
                    -----------------
                    
                    `)

                    // 更新时间
                    let recordTimeResult = await serverAction.setRecordTime({
                        wx: ~~wx,
                    }, {
                        used: true,
                        historytime: +new Date,
                    })

                    if (!recordTimeResult.ok) resolve({
                        err: '重新记录“开始时间”失败'
                    })

                    resolve(await serverAction.getFindNext(wx))

                }, 10 * 60 * 1000 - (nowTime - recordTimeResult.historytime))
            })
        } else { // 如果超过5分钟了就重新开始哦

            console.log(`
        
            -----------------
            我重新开始请求数据，重新开始抓取
            -----------------
            
            `)


            let allResult = await serverAction.getFindAll()
            if (!allResult.ok) return {
                err: '重新请求后端数据失败'
            }
            return await serverAction.getFindNext(wx)
        }
    }

    // 如果有数据
    let data = result[0]

    console.log(data, `

    exist 我的下一条数据是什么?  --- from 数据库

    `)

    let updateResult = await dbAction.updateOne('find', { // 更新当前数据为 已完成
        id: data.id
    }, {
        finish: 1
    })
    if (!updateResult.result.ok) return {
        err: '更新当前数据为“已完成”状态失败'
    }
    return data
}


/**
 * 更新微信，当前微信被干掉了
 */
serverAction.updateWx = async (wx) => {

    // 获取所有微信号记录
    let recordResult = await dbAction.find('record', {
        wx,
        used: false
    })

    if (recordResult.length) {
        let nextWx = recordResult[0]
        let result = await dbAction.updateMany('readlike', {
            wx,
        }, {
            wx: nextWx.wx
        })
        return result.result
    } else {
        return {
            err: '没有更多微信号咯'
        }
    }
}



serverAction.getHandleFindAll = async () => { // 从本地数据库获取所有处理过的数据
    let readLikeDATA = await dbAction.findAll('handlefind')
    let result = await axios.post('http://yundiao.web.xmchuangyi.com/crawler/index/receivePublic', readLikeDATA)
    if (result.data.code) return result.data // 如果发送数据失败就把错误信息返回
    // 清空已经处理过的数据，用来从来
    let del = await dbAction.delAll('handlefind')
    return serverAction.getFindAll()
}

serverAction.getHandleReadLikeAll = async () => { // 从本地数据库获取所有处理过的数据
    let readLikeDATA = await dbAction.findAll('handlereadlike')
    let result = await axios.post('http://yundiao.web.xmchuangyi.com/crawler/index/receiveArticle', readLikeDATA)
    if (result.data.code) return result.data // 如果发送数据失败就把错误信息返回
    // 清空已经处理过的数据，用于重来
    let del = await dbAction.delAll('handlereadlike')
    return serverAction.getReadLikeAll()

}

module.exports = serverAction;