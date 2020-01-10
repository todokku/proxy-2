const axios = require('axios')
const dbAction = require('./mongodb/index')
const serverAction = require('./mongodb/serverdata')
var helper = require('./util/helper')


async function test() {
    var updateResult = await axios.post('https://www.yundiao365.com/crawler/index/receiveArticleDetail', {
        machine_num: '30',
        data: {}
    }).catch(async err => {
        return await serverAction.recordErrNet(err, 'sendHandleFind').catch(err => ({
            error: true
        }))
    })

    console.log(updateResult)
}

function init() {
    test()
}
init()