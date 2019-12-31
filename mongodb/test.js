const dbAction = require('./index')

async function init() {

    let data = await dbAction.find('handlereadlike', {
        time
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

    console.log(data)


}

init()