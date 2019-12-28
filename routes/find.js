var express = require('express')
var router = express.Router()


var dbAction = require('../mongodb')
var serverAction = require('../mongodb/serverdata')


router.get('/', async function (req, res, next) {
    let findDATA2wx = await serverAction.getFindNext(~~req.query.wx)
    res.json(findDATA2wx)
})

module.exports = router