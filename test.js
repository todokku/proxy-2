const axios = require('axios')
const dbAction = require('./mongodb/index')
const serverAction = require('./mongodb/serverdata')
var helper = require('./util/helper')


async function test(wx) {

    // let sb = await dbAction.deleteMany('readlike', {
    //     order_id: {
    //         $in: [6755, 6824, 6786]
    //     }
    // })

    // console.log(sb.result)


    await dbAction.updateMany('readlike', {
        wx,
    }, {
        finish: 1
    }).catch(async err => console.log('重设标志为未完成失败'))



}

test(7)