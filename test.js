const axios = require('axios')
const dbAction = require('./mongodb/index')
const serverAction = require('./mongodb/serverdata')
var helper = require('./util/helper')


async function test(wx, num) {
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

    console.log(resDATA.status, resDATA.data, 'res')

    if (!resDATA.error) {
        // 记录发送数据结果
        await dbAction.insertOne('send_net', {
            time: helper.nowDATE(),
            wx,
            type: 'getFindReadLike',
            resdata: resDATA.data,
            resstatus: resDATA.status,
        }).catch(err => console.log(err, '数据库写入错误'))
    }
}

test(28, 60)