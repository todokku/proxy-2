const dbAction = require('./index')

async function init() {

    let result = await serverAction.getFindAll(1)
    console.log(result)


}

init()