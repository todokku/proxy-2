const dbAction = require('../mongodb/index')

const search = {}

/**
 * query 条件
 * limit 限制条件
 */
search.getnet = async (msgid, limit = {}) => { // 查询请求后台的数据

    const getNetDATA = await dbAction.find('get_net', limit) // 获取数据

    let result = []
    getNetDATA.forEach(item => {
        item.resdata.data && item.resdata.data.forEach(subitem => {
            if (subitem.msgid == msgid) result.push(item)
        })
    })

    console.log(`获取请求数据查询结果： `, result)

}